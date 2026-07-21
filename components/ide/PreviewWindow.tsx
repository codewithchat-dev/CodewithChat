'use client'

import React, { useEffect, useState } from 'react'
import { useWebContainer } from './WebContainerProvider'
import { RefreshCw, ExternalLink } from 'lucide-react'

export function PreviewWindow() {
  const { webcontainer } = useWebContainer()
  const [url, setUrl] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!webcontainer) return

    const unsub = webcontainer.on('server-ready', (port, serverUrl) => {
      console.log('Server is ready:', serverUrl)
      setUrl(serverUrl)
    })

    return () => {
      unsub()
    }
  }, [webcontainer])

  if (!url) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white text-stone-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
        <p>Waiting for dev server to start...</p>
        <p className="text-xs mt-2 text-stone-400">Run `npm run dev` in the terminal to start the server.</p>
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
