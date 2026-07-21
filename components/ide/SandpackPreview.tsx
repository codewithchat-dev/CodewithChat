'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview as SandpackPreviewPane,
  SandpackLayout,
  SandpackFileExplorer,
  SandpackConsole,
  useSandpack,
  defaultDark,
} from '@codesandbox/sandpack-react'
import { X, Terminal as TerminalIcon, ScrollText } from 'lucide-react'

export type SandpackView = 'preview' | 'code'
export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

interface SandpackPreviewProps {
  files: Record<string, string>
  dependencies?: Record<string, string>
  view?: SandpackView
  viewportSize?: ViewportSize
  isTerminalOpen?: boolean
  onCloseTerminal?: () => void
  onPreviewError?: (message: string) => void
  previewKey?: number
  /** 'preview' = flat Sandpack app; 'project' = full Vite/Next repo layout (code view only) */
  fileMode?: 'preview' | 'project'
  activeFile?: string | null
  tech?: string
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

const VIEWPORT_WIDTHS: Record<ViewportSize, string | undefined> = {
  desktop: undefined,
  tablet: '768px',
  mobile: '375px',
}

const MIN_CONSOLE_HEIGHT = 100
const DEFAULT_CONSOLE_HEIGHT = 200

export function SandpackPreview({
  files,
  dependencies = {},
  view = 'preview',
  viewportSize = 'desktop',
  isTerminalOpen = false,
  onCloseTerminal,
  onPreviewError,
  previewKey = 0,
  fileMode = 'preview',
  activeFile = null,
  tech = 'React + TypeScript',
}: SandpackPreviewProps) {
  const [consoleTab, setConsoleTab] = useState<'logs' | 'terminal'>('logs')
  const [consoleHeight, setConsoleHeight] = useState(DEFAULT_CONSOLE_HEIGHT)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleConsoleResizeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = consoleHeight

    const onMove = (moveEvent: PointerEvent) => {
      const maxHeight = containerRef.current
        ? Math.floor(containerRef.current.clientHeight * 0.75)
        : 480
      const nextHeight = Math.min(
        maxHeight,
        Math.max(MIN_CONSOLE_HEIGHT, startHeight - (moveEvent.clientY - startY)),
      )
      setConsoleHeight(nextHeight)
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [consoleHeight])

  const handlePreviewError = useCallback((message: string) => {
    setConsoleTab('logs')
    onPreviewError?.(message)
  }, [onPreviewError])

  const sandpackFiles = useMemo(() => {
    const result: Record<string, { code: string; active?: boolean }> = {}

    // Helper to strip massive base64 images that crash the Sandpack bundler
    const stripHugeBase64 = (content: string) => {
      if (!content) return content
      return content.replace(
        /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{1000,}/g,
        'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070'
      )
    }

    if (fileMode === 'project') {
      for (const [path, content] of Object.entries(files)) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`
        result[normalizedPath] = { code: stripHugeBase64(content) }
      }

      const preferredActive = [
        '/src/main.tsx',
        '/app/page.tsx',
        '/app/layout.tsx',
        '/package.json',
        '/vite.config.ts',
        '/next.config.mjs',
      ]
      if (activeFile) {
        const normalized = activeFile.startsWith('/') ? activeFile : `/${activeFile}`
        if (result[normalized]) {
          result[normalized] = { ...result[normalized], active: true }
        }
      } else {
        for (const path of preferredActive) {
          if (result[path]) {
            result[path] = { ...result[path], active: true }
            break
          }
        }
      }

      return result
    }

    const isVanilla = /html/i.test(tech)

    if (isVanilla) {
      for (const [path, content] of Object.entries(files)) {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`
        result[normalizedPath] = { code: stripHugeBase64(content) }
      }
      return result
    }

    for (const [path, content] of Object.entries(files)) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`
      result[normalizedPath] = { code: stripHugeBase64(content) }
    }

    if (activeFile) {
      const normalized = activeFile.startsWith('/') ? activeFile : `/${activeFile}`
      if (result[normalized]) {
        result[normalized] = { ...result[normalized], active: true }
      }
    } else if (result['/App.tsx']) {
      result['/App.tsx'] = { ...result['/App.tsx'], active: true }
    } else if (result['/App.js']) {
      result['/App.js'] = { ...result['/App.js'], active: true }
    }

    // Safety check: Sandpack will crash the entire app if package.json is invalid JSON.
    if (result['/package.json']) {
      try {
        JSON.parse(result['/package.json'].code)
      } catch (e) {
        console.warn('Invalid package.json detected, removing to prevent Sandpack crash.')
        delete result['/package.json']
      }
    }

    return result
  }, [files, fileMode, activeFile])

  const mergedDeps = useMemo(() => ({
    'lucide-react': 'latest',
    ...dependencies,
  }), [dependencies])

  const viewportWidth = VIEWPORT_WIDTHS[viewportSize]
  const isConstrained = viewportSize !== 'desktop'
  const isProjectFiles = fileMode === 'project'

  const isVanilla = /html/i.test(tech || '')
  const isTypeScript = Object.keys(sandpackFiles).some(f => f.endsWith('.ts') || f.endsWith('.tsx'))

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden bg-[#151515]">
      <SandpackProvider
        key={previewKey}
        template={isVanilla ? "static" : isTypeScript ? "react-ts" : "react"}
        files={sandpackFiles}
        customSetup={isProjectFiles || isVanilla ? undefined : {
          dependencies: mergedDeps,
        }}
        options={{
          externalResources: isVanilla ? [] : ['https://cdn.tailwindcss.com'],
          recompileMode: 'delayed',
          recompileDelay: 600,
        }}
        theme={defaultDark}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
      >
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
            className="w-full h-full items-center justify-center bg-[#0a0a0a]"
          >
            {isConstrained ? (
              <div
                className="h-full overflow-hidden shadow-2xl transition-all duration-300 rounded-lg"
                style={{ width: viewportWidth, border: '1px solid hsl(var(--border))' }}
              >
                <SandpackPreviewPane
                  showNavigator={false}
                  showOpenInCodeSandbox={false}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            ) : (
              <SandpackPreviewPane
                showNavigator={false}
                showOpenInCodeSandbox={false}
                style={{ height: '100%', width: '100%' }}
              />
            )}
          </div>
        </div>

        {/* TERMINAL / CONSOLE DRAWER */}
        {isTerminalOpen && (
          <div
            className="bg-[#0f0f0f] flex flex-col shrink-0 animate-in slide-in-from-bottom-2 duration-200"
            style={{ height: consoleHeight }}
          >
            {/* Drag handle — pull up/down to resize */}
            <div
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize console"
              onPointerDown={handleConsoleResizeStart}
              className="h-2 shrink-0 cursor-row-resize flex items-center justify-center border-t border-[#2a2a2a] bg-[#141414] hover:bg-[#1f1f1f] active:bg-primary/10 transition-colors touch-none"
            >
              <div className="w-12 h-1 rounded-full bg-zinc-600" />
            </div>
            {/* Header with Logs/Terminal tabs */}
            <div className="flex items-center justify-between px-2 border-b border-[#2a2a2a] shrink-0">
              <div className="flex items-center gap-0">
                {/* Logs tab */}
                <button
                  onClick={() => setConsoleTab('logs')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    consoleTab === 'logs'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ScrollText className="size-3.5" />
                  Logs
                </button>
                {/* Terminal tab */}
                <button
                  onClick={() => setConsoleTab('terminal')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    consoleTab === 'terminal'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <TerminalIcon className="size-3.5" />
                  Terminal
                </button>
              </div>
              <button
                onClick={onCloseTerminal}
                className="p-1.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {consoleTab === 'logs' ? (
                <SandpackConsole
                  style={{ height: '100%', background: '#0f0f0f', fontSize: '12px' }}
                />
              ) : (
                <div className="h-full flex flex-col p-3 font-mono text-xs text-zinc-400">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-zinc-600">bash</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-emerald-500">$</span>
                      <span className="text-zinc-500">Terminal runs in the browser sandbox</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-emerald-500">$</span>
                      <span className="text-zinc-600">Download ZIP to run locally with full terminal access</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SandpackProvider>
    </div>
  )
}
