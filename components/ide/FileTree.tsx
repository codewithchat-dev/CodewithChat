'use client'

import React, { useState, useMemo } from 'react'
import { Folder, FolderOpen, FileCode, FileText, FileJson, ChevronRight, ChevronDown, File } from 'lucide-react'

interface FileTreeProps {
  files: Record<string, string>
  activeFile: string | null
  onFileSelect: (path: string) => void
}

type TreeNode = {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: Record<string, TreeNode>
}

export function FileTree({ files, activeFile, onFileSelect }: FileTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['/']))

  const fileTree = useMemo(() => {
    const root: TreeNode = { name: 'root', path: '/', type: 'dir', children: {} }
    
    Object.keys(files).forEach((filePath) => {
      const parts = filePath.split('/').filter(Boolean)
      let currentDir = root

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1
        const currentPath = '/' + parts.slice(0, index + 1).join('/')
        
        if (!currentDir.children![part]) {
          currentDir.children![part] = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'dir',
            children: isFile ? undefined : {},
          }
        }
        if (!isFile) {
          currentDir = currentDir.children![part]
        }
      })
    })
    
    return root
  }, [files])

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const getIcon = (name: string, type: 'file' | 'dir', isExpanded: boolean) => {
    if (type === 'dir') {
      return isExpanded ? <FolderOpen className="w-4 h-4 text-blue-400 mr-1.5" /> : <Folder className="w-4 h-4 text-blue-400 mr-1.5" />
    }
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode className="w-4 h-4 text-blue-500 mr-1.5" />
    if (name.endsWith('.jsx') || name.endsWith('.js')) return <FileCode className="w-4 h-4 text-yellow-400 mr-1.5" />
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-green-400 mr-1.5" />
    if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-stone-300 mr-1.5" />
    return <File className="w-4 h-4 text-stone-400 mr-1.5" />
  }

  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedDirs.has(node.path)
    
    const children = node.children ? Object.values(node.children).sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    }) : []

    return (
      <div key={node.path} className="w-full">
        {node.path !== '/' && (
          <div
            className={`flex items-center py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] select-none ${activeFile === node.path ? 'bg-[#37373d] text-white' : 'text-stone-300'}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => node.type === 'dir' ? toggleDir(node.path) : onFileSelect(node.path)}
          >
            {node.type === 'dir' ? (
              isExpanded ? <ChevronDown className="w-3.5 h-3.5 mr-1 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 mr-1 text-stone-400" />
            ) : <span className="w-4.5" />}
            {getIcon(node.name, node.type, isExpanded)}
            <span className="text-sm truncate">{node.name}</span>
          </div>
        )}
        
        {(isExpanded || node.path === '/') && children.map(child => renderNode(child, node.path === '/' ? 0 : depth + 1))}
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#181818] py-2 border-r border-[#2b2b2b]">
      <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 px-4">EXPLORER</div>
      {renderNode(fileTree)}
    </div>
  )
}
