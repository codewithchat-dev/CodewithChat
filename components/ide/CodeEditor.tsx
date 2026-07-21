'use client'

import React from 'react'
import Editor from '@monaco-editor/react'
import { useWebContainer } from './WebContainerProvider'

interface CodeEditorProps {
  activeFile: string | null
  fileContent: string
  onContentChange: (content: string | undefined) => void
}

export function CodeEditor({ activeFile, fileContent, onContentChange }: CodeEditorProps) {
  const getLanguage = (path: string) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript'
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript'
    if (path.endsWith('.css')) return 'css'
    if (path.endsWith('.html')) return 'html'
    if (path.endsWith('.json')) return 'json'
    if (path.endsWith('.md')) return 'markdown'
    return 'plaintext'
  }

  if (!activeFile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-stone-500">
        Select a file to view code
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        path={activeFile}
        language={getLanguage(activeFile)}
        theme="vs-dark"
        value={fileContent}
        onChange={onContentChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16 },
        }}
      />
    </div>
  )
}
