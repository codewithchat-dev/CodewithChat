'use client'

import React, { useEffect, useState } from 'react'
import { useWebContainer } from './WebContainerProvider'
import { RefreshCw, ExternalLink, Loader2, Terminal, Package } from 'lucide-react'

type Stage = 'booting' | 'installing' | 'starting' | 'ready'

const STAGE_MESSAGES: Record<Stage, { icon: React.ReactNode; title: string; sub: string }> = {
  booting: {
    icon: <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />,
    title: 'Booting WebContainer…',
    sub: 'Setting up isolated Node.js environment',
  },
  installing: {
    icon: <Package className="w-7 h-7 text-indigo-500 animate-pulse" />,
    title: 'Installing dependencies…',
    sub: 'Running npm install — this can take 30–60 seconds',
  },
  starting: {
    icon: <Terminal className="w-7 h-7 text-indigo-500 animate-pulse" />,
    title: 'Starting dev server…',
    sub: 'Running npm run dev',
  },
  ready: {
    icon: null,
    title: '',
    sub: '',
  },
}

export function PreviewWindow() {
  const { webcontainer, isBooting } = useWebContainer()
  const [url, setUrl] = useState<string | null>(null)
  const [stage, setStage] = useState<Stage>('booting')
  const [key, setKey] = useState(0)

  // Track boot stage via terminal output events
  useEffect(() => {
    if (!webcontainer) return

    setStage('installing')

    const unsub = webcontainer.on('server-ready', (_port, serverUrl) => {
      setUrl(serverUrl)
      setStage('ready')
    })

    // Listen to terminal output to detect npm install vs npm run dev
    // WebContainer emits a 'port' event before server-ready in some versions
    const unsubPort = webcontainer.on('port', () => {
      setStage('starting')
    })

    return () => {
      unsub()
      unsubPort()
    }
  }, [webcontainer])

  // Update stage when booting finishes
  useEffect(() => {
    if (!isBooting && stage === 'booting') setStage('installing')
  }, [isBooting, stage])

  if (!url) {
    const { icon, title, sub } = STAGE_MESSAGES[stage]
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#fafafa] text-stone-500 gap-3 p-8 text-center">
        {icon}
        <div>
          <p className="font-medium text-stone-700 text-sm">{title}</p>
          <p className="text-xs mt-1 text-stone-400">{sub}</p>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 mt-2">
          {(['booting', 'installing', 'starting'] as Stage[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                stage === s
                  ? 'bg-indigo-500'
                  : ['booting', 'installing', 'starting'].indexOf(s) < ['booting', 'installing', 'starting'].indexOf(stage)
                  ? 'bg-indigo-300'
                  : 'bg-stone-300'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Preview Header */}
      <div className="h-10 bg-stone-100 border-b border-stone-200 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <div className="bg-white border border-stone-300 text-xs text-stone-500 px-3 py-1 rounded-full flex-1 truncate max-w-xs">
            {url}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setKey(k => k + 1)}
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-200 transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a 
            href={url}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-200 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      {/* Iframe */}
      <div className="flex-1 w-full bg-white relative">
        <iframe
          key={key}
          src={url}
          className="absolute inset-0 w-full h-full border-0"
          allow="cross-origin-isolated"
        />
      </div>
    </div>
  )
}
