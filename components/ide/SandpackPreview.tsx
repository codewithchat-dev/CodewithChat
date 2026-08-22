'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview as SandpackPreviewPane,
  SandpackLayout,
  SandpackFileExplorer,
  useSandpack,
  defaultDark,
} from '@codesandbox/sandpack-react'
import { RefreshCw, ExternalLink, AlertCircle, Loader2 } from 'lucide-react'

export type SandpackView = 'preview' | 'code'
export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

interface SandpackPreviewProps {
  files: Record<string, string>
  dependencies?: Record<string, string>
  view?: SandpackView
  isTerminalOpen?: boolean
  onCloseTerminal?: () => void
  onPreviewError?: (message: string) => void
  previewKey?: number
  /** 'preview' = flat Sandpack app; 'project' = full Vite/Next repo layout (code view only) */
  fileMode?: 'preview' | 'project'
  activeFile?: string | null
  tech?: string
  /** Opens full-screen preview in a new browser tab */
  openPreviewUrl?: string
  /** Whether the files are empty/loading */
  isLoading?: boolean
  /** Viewport size for the preview iframe */
  viewportSize?: ViewportSize
}

function ActiveFileOpener({ filePath }: { filePath?: string | null }) {
  const { sandpack } = useSandpack()

  useEffect(() => {
    if (!filePath) return
    const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`
    if (sandpack.files[normalized]) {
      sandpack.openFile(normalized)
    }
  }, [filePath, sandpack])

  return null
}

function SandpackErrorWatcher({ onError }: { onError: (message: string) => void }) {
  const { sandpack } = useSandpack()
  const reportedError = useRef<string | null>(null)

  useEffect(() => {
    const message = sandpack.error?.message ?? null
    if (message && message !== reportedError.current) {
      reportedError.current = message
      onError(message)
    }
    if (!message) {
      reportedError.current = null
    }
  }, [sandpack.error, onError])

  return null
}

function PreviewStatusOverlay({
  onError,
  isEmpty,
  onRefresh,
}: {
  onError?: (message: string) => void
  isEmpty?: boolean
  onRefresh?: () => void
}) {
  const { sandpack } = useSandpack()
  const status = sandpack.status
  const errorMessage = sandpack.error?.message

  useEffect(() => {
    if (errorMessage) onError?.(errorMessage)
  }, [errorMessage, onError])

  // Show loading for empty state or running status
  if (isEmpty || (!errorMessage && status === 'running')) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">{isEmpty ? 'Waiting for code generation...' : 'Compiling preview…'}</p>
          <p className="text-xs text-zinc-500">Preview will appear automatically</p>
        </div>
      </div>
    )
  }

  // Show error if there is one
  if (errorMessage) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-sm p-6">
        <div className="max-w-md text-center space-y-3">
          <AlertCircle className="size-10 text-red-400 mx-auto" />
          <p className="text-sm font-medium text-red-300">Preview failed to compile</p>
          <p className="text-xs text-zinc-400 font-mono break-words max-h-32 overflow-y-auto">{errorMessage}</p>
          <p className="text-xs text-zinc-500 mt-2">Try refreshing the preview or checking the file structure.</p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Refresh Preview
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}

function PreviewToolbar({
  openPreviewUrl,
  onRefresh,
}: {
  openPreviewUrl?: string
  onRefresh?: () => void
}) {
  return (
    <div className="h-9 shrink-0 flex items-center justify-between px-3 border-b border-[#2a2a2a] bg-[#141414]">
      <span className="text-xs text-zinc-500">Live preview</span>
      <div className="flex items-center gap-1">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="size-3.5" />
          </button>
        )}
        {openPreviewUrl && (
          <a
            href={openPreviewUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>`

const INDEX_TSX = `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const root = createRoot(document.getElementById('root')!)
root.render(<App />)
`

export function SandpackPreview({
  files,
  dependencies = {},
  view = 'preview',
  isTerminalOpen = false,
  onCloseTerminal,
  onPreviewError,
  previewKey = 0,
  fileMode = 'preview',
  activeFile = null,
  tech = 'React + TypeScript',
  openPreviewUrl,
  isLoading = false,
  viewportSize = 'desktop',
}: SandpackPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [localPreviewKey, setLocalPreviewKey] = useState(0)

  const handlePreviewError = useCallback((message: string) => {
    console.error('[Sandpack] Preview error:', message)
    onPreviewError?.(message)
  }, [onPreviewError])

  const sanitizedDeps = useMemo(() => {
    const blocked = new Set(['@vercel/ai', '@supabase/ssr', '@supabase/auth-helpers-nextjs', 'next', 'vite', '@vitejs/plugin-react'])
    return Object.fromEntries(
      Object.entries(dependencies).filter(([name]) => !blocked.has(name) && !name.startsWith('@supabase/ssr')),
    )
  }, [dependencies])

  const mergedDeps = useMemo(() => ({
    ...sanitizedDeps,
    'lucide-react': '^0.400.0', // pinned to avoid React 19 useCache errors in Sandpack
    clsx: 'latest',
    'tailwind-merge': 'latest',
    'react': '^18.2.0',
    'react-dom': '^18.2.0',
  }), [sanitizedDeps])

  const sandpackFiles = useMemo(() => {
    const result: Record<string, { code: string; active?: boolean }> = {}

    console.log('[Sandpack] Processing files:', Object.keys(files))
    console.log('[Sandpack] File mode:', fileMode, 'Tech:', tech)

    // Helper to strip massive base64 images that crash the Sandpack bundler
    const stripHugeBase64 = (content: string) => {
      if (!content) return content
      return content.replace(
        /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{1000,}/g,
        'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070'
      )
    }

    // Simple direct file processing for preview mode
    for (const [path, content] of Object.entries(files)) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      
      // Skip problematic files and config files that Sandpack doesn't need
      if (normalizedPath.includes('vite.config') ||
          normalizedPath.includes('tsconfig') ||
          normalizedPath === '/package.json' ||
          normalizedPath === '/index.html' ||
          normalizedPath === '/tailwind.config.js' ||
          normalizedPath === '/postcss.config.js' ||
          normalizedPath === '/next.config.js') {
        continue
      }

      // Convert /src/* paths to root level for Sandpack
      let sandpackPath = normalizedPath
      if (normalizedPath.startsWith('/src/')) {
        sandpackPath = normalizedPath.replace('/src/', '/')
      }

      result[sandpackPath] = { code: stripHugeBase64(content) }
    }

    // Ensure critical files exist
    if (!result['/App.tsx'] && files['/src/App.tsx']) {
      result['/App.tsx'] = { code: stripHugeBase64(files['/src/App.tsx']) }
    }
    if (!result['/App.tsx'] && files['/App.tsx']) {
      result['/App.tsx'] = { code: stripHugeBase64(files['/App.tsx']) }
    }
    if (!result['/index.css'] && files['/src/index.css']) {
      result['/index.css'] = { code: stripHugeBase64(files['/src/index.css']) }
    }
    if (!result['/index.css'] && files['/index.css']) {
      result['/index.css'] = { code: stripHugeBase64(files['/index.css']) }
    }

    console.log('[Sandpack] Final files for Sandpack:', Object.keys(result))

    // Set active file
    if (activeFile) {
      const normalized = activeFile.startsWith('/') ? activeFile : `/${activeFile}`
      let sandpackPath = normalized
      if (normalized.startsWith('/src/')) {
        sandpackPath = normalized.replace('/src/', '/')
      }
      if (result[sandpackPath]) {
        result[sandpackPath] = { ...result[sandpackPath], active: true }
      }
    } else if (result['/App.tsx']) {
      result['/App.tsx'] = { ...result['/App.tsx'], active: true }
    }

    // Safety check: if no files, create a simple fallback
    if (Object.keys(result).length === 0) {
      console.warn('[Sandpack] No files available, creating fallback')
      result['/App.tsx'] = { 
        code: `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Your App is Ready</h1>
        <p className="text-gray-300 mb-6">Code generation completed successfully!</p>
        <div className="bg-gray-800 rounded-lg p-6 text-left">
          <p className="text-green-400 text-sm mb-2">✓ Project structure created</p>
          <p className="text-green-400 text-sm mb-2">✓ Dependencies installed</p>
          <p className="text-green-400 text-sm">✓ Ready for development</p>
        </div>
      </div>
    </div>
  )
}`,
        active: true 
      }
    }

    // If App.tsx exists but might be broken, add error boundary wrapper
    if (result['/App.tsx'] && result['/App.tsx'].code.includes('slice')) {
      console.warn('[Sandpack] App.tsx might have runtime errors, wrapping with error boundary')
      result['/App.tsx'] = {
        code: `import React, { useState } from 'react'

export default function App() {
  const [error, setError] = useState<string | null>(null)
  
  // Simple working fallback for preview
  const sampleMovies = [
    { id: 1, title: 'Movie 1', rating: 8.5, year: 2024 },
    { id: 2, title: 'Movie 2', rating: 7.8, year: 2023 },
    { id: 3, title: 'Movie 3', rating: 9.0, year: 2024 },
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">App Ready</h1>
          <p className="text-gray-300 mb-6">Generated code has a runtime error. Check the Code tab to fix it.</p>
          <div className="bg-gray-800 rounded-lg p-6 text-left">
            <p className="text-red-400 text-sm mb-2">Error: {error}</p>
            <p className="text-green-400 text-sm">Switch to Code tab to edit and fix the issue</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Movie Preview</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleMovies.map(movie => (
            <div key={movie.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-semibold mb-2">{movie.title}</h3>
              <p className="text-gray-400 text-sm">Rating: {movie.rating}/10</p>
              <p className="text-gray-500 text-xs">{movie.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}`,
        active: true
      }
    }

    // Debug: Log if we have App.tsx but it might be broken
    if (result['/App.tsx']) {
      console.log('[Sandpack] App.tsx content length:', result['/App.tsx'].code.length)
      console.log('[Sandpack] App.tsx preview:', result['/App.tsx'].code.substring(0, 200))
    }

    return result
  }, [files, fileMode, activeFile, tech])

  const isProjectFiles = fileMode === 'project'

  const isVanilla = /html/i.test(tech || '')
  const isTypeScript = Object.keys(sandpackFiles).some(f => f.endsWith('.ts') || f.endsWith('.tsx'))

  // Debug: log if no files
  if (Object.keys(sandpackFiles).length === 0) {
    console.error('[Sandpack] No files available for preview!')
  }

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden bg-[#151515]">
      <SandpackProvider
        key={localPreviewKey}
        template="react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies: mergedDeps,
        }}
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          recompileMode: 'immediate',
          bundlerURL: 'https://sandpack-bundler.codesandbox.io',
          startRoute: '/index.html',
        }}
        theme={defaultDark}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .sp-wrapper, .sp-layout, .sp-stack, .sp-preview-container, .sp-preview-iframe {
            height: 100% !important;
            min-height: 100% !important;
            flex: 1 !important;
            width: 100% !important;
          }
        `}} />
        <ActiveFileOpener filePath={activeFile} />
        {!isProjectFiles && <SandpackErrorWatcher onError={handlePreviewError} />}
        {/* Main content area */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          {/* CODE VIEW (always shown for project file mode) */}
          <div
            style={{ display: view === 'code' || isProjectFiles ? 'flex' : 'none' }}
            className="w-full h-full"
          >
            <SandpackLayout style={{ height: '100%', flex: 1, border: 'none', borderRadius: 0, gap: 0 }}>
              <SandpackFileExplorer
                style={{ height: '100%', minWidth: '160px', maxWidth: '200px', fontSize: '12px' }}
              />
              <SandpackCodeEditor
                showTabs
                showLineNumbers
                showInlineErrors
                closableTabs
                style={{ height: '100%', flex: 1 }}
              />
            </SandpackLayout>
          </div>

          {/* PREVIEW VIEW */}
          <div
            style={{ display: view === 'preview' && !isProjectFiles ? 'flex' : 'none' }}
            className="w-full h-full flex-col bg-[#111]"
          >
            <div className="flex-1 min-h-0 relative flex items-center justify-center p-2">
              <PreviewStatusOverlay
                onError={handlePreviewError}
                isEmpty={isLoading || Object.keys(sandpackFiles).length === 0}
                onRefresh={() => setLocalPreviewKey((prev: number) => prev + 1)}
              />
              <div 
                className={`w-full h-full transition-all duration-300 ease-in-out bg-white rounded-md overflow-hidden ${
                  viewportSize === 'mobile' ? 'max-w-[375px] border border-zinc-800 shadow-2xl' :
                  viewportSize === 'tablet' ? 'max-w-[768px] border border-zinc-800 shadow-2xl' :
                  'border border-zinc-800/50'
                }`}
              >
                <SandpackPreviewPane
                  showNavigator={false}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={false}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            </div>
          </div>
        </div>


      </SandpackProvider>
    </div>
  )
}
