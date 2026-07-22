'use client'

import React, { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from '@xterm/addon-fit'
import 'xterm/css/xterm.css'
import { useWebContainer } from './WebContainerProvider'

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const { webcontainer } = useWebContainer()

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return

    const terminal = new XTerm({
      convertEol: true,
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    })
    
    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    terminal.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = terminal
    fitAddonRef.current = fitAddon

    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
      xtermRef.current = null
    }
  }, [])

  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!webcontainer || !xtermRef.current) return
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    let processInstance: any
    let onDataDisposable: any

    async function startShell() {
      const process = await webcontainer!.spawn('jsh', {
        terminal: {
          cols: xtermRef.current!.cols,
          rows: xtermRef.current!.rows,
        },
      })
      
      processInstance = process

      const input = process.input.getWriter()
      
      let commandInjected = false
      onDataDisposable = xtermRef.current?.onData((data: string) => {
        input.write(data)
      })

      // Wait for jsh to be ready by listening to output before injecting the command
      const outputStream = new WritableStream({
        write(data) {
          xtermRef.current?.write(data)
          // Inject command when the prompt appears for the first time
          if (!commandInjected && (data.includes('❯') || data.includes('~') || data.includes('$'))) {
            commandInjected = true
            // Small delay just to be safe after prompt appears
            setTimeout(() => {
              input.write('npm install --no-audit --no-fund --legacy-peer-deps --omit=optional && npm run dev\r')
            }, 200)
          }
        },
      })

      process.output.pipeTo(outputStream)
    }

    startShell()

    return () => {
      // Intentionally not resetting hasStartedRef.current to prevent double spawn in Strict Mode
      if (onDataDisposable) {
        onDataDisposable.dispose()
      }
      if (processInstance) {
        processInstance.kill()
      }
    }
  }, [webcontainer])

  return (
    <div className="w-full h-full overflow-hidden bg-[#1e1e1e] p-2">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  )
}
