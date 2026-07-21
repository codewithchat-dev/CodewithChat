'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { WebContainer } from '@webcontainer/api'

interface WebContainerContextType {
  webcontainer: WebContainer | null
  isBooting: boolean
  error: Error | null
}

const WebContainerContext = createContext<WebContainerContextType>({
  webcontainer: null,
  isBooting: false,
  error: null,
})

let webcontainerInstance: WebContainer | null = null
let bootPromise: Promise<WebContainer> | null = null

export function WebContainerProvider({ children }: { children: React.ReactNode }) {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null)
  const [isBooting, setIsBooting] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function boot() {
      try {
        if (webcontainerInstance) {
          setWebcontainer(webcontainerInstance)
          setIsBooting(false)
          return
        }

        if (!bootPromise) {
          bootPromise = WebContainer.boot()
        }

        const instance = await bootPromise
        webcontainerInstance = instance
        setWebcontainer(instance)
        setIsBooting(false)
      } catch (err) {
        console.error('Failed to boot WebContainer:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsBooting(false)
      }
    }

    boot()
  }, [])

  return (
    <WebContainerContext.Provider value={{ webcontainer, isBooting, error }}>
      {children}
    </WebContainerContext.Provider>
  )
}

export function useWebContainer() {
  return useContext(WebContainerContext)
}
