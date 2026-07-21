'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { WebContainerProvider, useWebContainer } from './WebContainerProvider'
import { FileTree } from './FileTree'
import { CodeEditor } from './CodeEditor'
import { Terminal } from './Terminal'
import { PreviewWindow } from './PreviewWindow'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { Spinner } from '@/components/ui/spinner'

interface WebIDEProps {
  files: Record<string, string>
}

function toFsPath(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path
}

// Known-good tsconfig.json for Next.js 14 projects
const FALLBACK_TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: "es5",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "bundler",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    plugins: [{ name: "next" }],
    paths: { "@/*": ["./*"] }
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"]
}, null, 2)

// Patch files for WebContainer compatibility
function patchForWebContainer(files: Record<string, string>): Record<string, string> {
  const patched = { ...files }

  // 1. Patch package.json for WebContainer compatibility
  const pkgKey = patched['/package.json'] ? '/package.json' : patched['package.json'] ? 'package.json' : null
  if (pkgKey) {
    try {
      const pkg = JSON.parse(patched[pkgKey])

      // Detect Next.js version to match swc-wasm-nodejs version
      const nextVersion = pkg.dependencies?.next || pkg.devDependencies?.next
      if (nextVersion) {
        // Strip leading ^ or ~ to get exact version for swc-wasm
        const exactVersion = nextVersion.replace(/^[\^~]/, '')
        
        // CRITICAL: Add @next/swc-wasm-nodejs as a regular dependency
        // WebContainer can't load native SWC binaries, but WASM works fine.
        // It must be in dependencies (not devDependencies/optionalDependencies)
        // so `npm install --omit=optional` still installs it.
        if (!pkg.dependencies) pkg.dependencies = {}
        pkg.dependencies['@next/swc-wasm-nodejs'] = exactVersion

        // Also remove from devDependencies if present (to avoid version conflicts)
        if (pkg.devDependencies?.['@next/swc-wasm-nodejs']) {
          delete pkg.devDependencies['@next/swc-wasm-nodejs']
        }
      }

      // CRITICAL: Ensure dev script uses NEXT_SWC_WASM_ENABLE=1
      // This tells Next.js to look for the WASM binary instead of native ones
      if (pkg.scripts?.dev) {
        // Remove any existing NEXT_SWC_WASM_ENABLE prefix first
        const cleanDev = pkg.scripts.dev.replace(/NEXT_SWC_WASM_ENABLE=\d\s*/g, '').trim()
        pkg.scripts.dev = `NEXT_SWC_WASM_ENABLE=1 ${cleanDev}`
      }

      patched[pkgKey] = JSON.stringify(pkg, null, 2)
    } catch {
      // If package.json can't be parsed, leave it alone
    }
  }

  // 2. Fix tsconfig.json — AI often generates invalid JSON (trailing commas, comments, etc.)
  const tscKey = patched['/tsconfig.json'] ? '/tsconfig.json' : patched['tsconfig.json'] ? 'tsconfig.json' : null
  if (tscKey) {
    try {
      const cleaned = patched[tscKey]
        .replace(/\/\/.*$/gm, '')        // strip single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // strip block comments
        .replace(/,\s*([\]}])/g, '$1')    // strip trailing commas
      JSON.parse(cleaned) // validate
      patched[tscKey] = cleaned
    } catch {
      // If still broken, replace with a known-good default
      patched[tscKey] = FALLBACK_TSCONFIG
    }
  }

  // 3. Fix next.config — remove `experimental: { serverActions: true }` (boolean invalid in Next 14.2+)
  for (const configKey of ['/next.config.js', '/next.config.mjs', 'next.config.js', 'next.config.mjs']) {
    if (patched[configKey]) {
      patched[configKey] = patched[configKey]
        .replace(/experimental\s*:\s*\{\s*serverActions\s*:\s*(true|false)\s*,?\s*\}/g, '')
        .replace(/,\s*,/g, ',')
        .replace(/\{\s*,/g, '{')
        .replace(/,\s*\}/g, '}')
    }
  }

  return patched
}

// Helper to convert flat path dictionary to WebContainer file tree
function buildFileSystemTree(files: Record<string, string>) {
  const tree: any = {}
  
  for (const [path, content] of Object.entries(files)) {
    const parts = path.split('/').filter(Boolean)
    let current = tree
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (i === parts.length - 1) {
        current[part] = {
          file: {
            contents: content
          }
        }
      } else {
        if (!current[part]) {
          current[part] = { directory: {} }
        }
        current = current[part].directory
      }
    }
  }
  
  return tree
}

function IDEContent({ files }: WebIDEProps) {
  const { webcontainer, isBooting, error } = useWebContainer()
  const patchedFiles = useMemo(() => patchForWebContainer(files), [files])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<Record<string, string>>(patchedFiles)
  const [mounted, setMounted] = useState(false)
  const [bootStage, setBootStage] = useState<'mounting' | 'installing' | 'starting' | 'ready'>('mounting')
  const [defaultFileSet, setDefaultFileSet] = useState(false)

  // Mount files when container is ready
  useEffect(() => {
    if (webcontainer && !mounted && Object.keys(patchedFiles).length > 0) {
      const tree = buildFileSystemTree(patchedFiles)
      webcontainer.mount(tree).then(async () => {
        setMounted(true)
        setBootStage('ready')
      })
    }
  }, [webcontainer, patchedFiles, mounted])

  useEffect(() => {
    if (!defaultFileSet && Object.keys(files).length > 0) {
      const firstFile = Object.keys(files).sort()[0]
      setActiveFile(firstFile)
      setDefaultFileSet(true)
    }
  }, [files, defaultFileSet])

  // Sync external file changes (e.g., from AI streaming) to WebContainer
  // IMPORTANT: Use patchedFiles (not raw files) so config fixes aren't overwritten
  useEffect(() => {
    if (!webcontainer || !mounted) return
    
    const syncFiles = async () => {
      for (const [path, content] of Object.entries(patchedFiles)) {
        if (fileContents[path] !== content) {
          try {
            const fsPath = toFsPath(path)
            const dir = fsPath.substring(0, fsPath.lastIndexOf('/'))
            if (dir) {
              await webcontainer.fs.mkdir(dir, { recursive: true })
            }
            await webcontainer.fs.writeFile(fsPath, content)
            setFileContents(prev => ({ ...prev, [path]: content }))
          } catch (err) {
            console.error(`Failed to sync file ${path}:`, err)
          }
        }
      }
    }
    syncFiles()
  }, [patchedFiles, webcontainer, mounted])

  const handleContentChange = async (newContent: string | undefined) => {
    if (!newContent || !activeFile || !webcontainer) return
    
    // Prevent infinite loop: only write if content actually changed
    if (fileContents[activeFile] === newContent) return;
    
    setFileContents(prev => ({ ...prev, [activeFile]: newContent }))
    
    try {
      // Write to webcontainer file system
      await webcontainer.fs.writeFile(toFsPath(activeFile), newContent)
    } catch (err) {
      console.error('Failed to write file:', err)
    }
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-red-400 p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Failed to start WebContainer</h3>
        <p>{error.message}</p>
        <p className="mt-4 text-sm text-stone-500">Note: WebContainers require a desktop browser with cross-origin isolation enabled.</p>
      </div>
    )
  }

  if (isBooting || !mounted) {
    const bootMessage = !webcontainer
      ? 'Booting WebContainer...'
      : bootStage === 'installing'
        ? 'Installing dependencies (npm install)...'
        : 'Mounting project files...'

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-stone-400">
        <Spinner className="w-8 h-8 text-indigo-500 mb-4" />
        <p>{bootMessage}</p>
        <p className="mt-2 text-xs text-stone-500">First launch can take 30–60 seconds</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#1e1e1e] text-stone-300 flex flex-col overflow-hidden">
      <PanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar: File Tree */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <FileTree 
            files={fileContents} 
            activeFile={activeFile} 
            onFileSelect={setActiveFile} 
          />
        </Panel>
        
        <PanelResizeHandle className="w-1 bg-[#2b2b2b] hover:bg-indigo-500 transition-colors cursor-col-resize" />
        
        {/* Center: Editor & Terminal */}
        <Panel defaultSize={40} minSize={30}>
          <PanelGroup direction="vertical">
            <Panel defaultSize={70} minSize={30}>
              <CodeEditor 
                activeFile={activeFile}
                fileContent={activeFile ? fileContents[activeFile] || '' : ''}
                onContentChange={handleContentChange}
              />
            </Panel>
            
            <PanelResizeHandle className="h-1 bg-[#2b2b2b] hover:bg-indigo-500 transition-colors cursor-row-resize" />
            
            <Panel defaultSize={30} minSize={10}>
              <Terminal />
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#2b2b2b] hover:bg-indigo-500 transition-colors cursor-col-resize" />
        
        {/* Right: Preview */}
        <Panel defaultSize={40} minSize={30}>
          <PreviewWindow />
        </Panel>
      </PanelGroup>
    </div>
  )
}

export function WebIDE({ files }: WebIDEProps) {
  return (
    <WebContainerProvider>
      <IDEContent files={files} />
    </WebContainerProvider>
  )
}
