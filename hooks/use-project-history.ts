'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getProjects, deleteProjectAction, togglePinProjectAction } from '@/app/actions/projects'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'

export type Project = {
  id: string
  title: string
  prompt: string
  code?: string | null
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

export function useProjectHistory() {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  const fetchProjects = useCallback(async () => {
    if (!isLoaded || !userId) return
    const res = await getProjects()
    if (res.success && res.data) {
      setProjects(res.data as unknown as Project[])
    }
    setIsLoadingHistory(false)
  }, [isLoaded, userId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Custom event listener to instantly sync sidebar when a project is generated
  useEffect(() => {
    const handleSync = () => fetchProjects()
    window.addEventListener('project_history_updated', handleSync)
    return () => window.removeEventListener('project_history_updated', handleSync)
  }, [fetchProjects])

  const togglePin = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const project = projects.find(p => p.id === id)
    if (!project) return
    
    // Optimistic UI update for instant feedback
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p))
    
    const res = await togglePinProjectAction(id, !project.isPinned)
    if (!res.success) {
      toast.error('Failed to pin project')
      fetchProjects() // Revert UI if DB fails
    }
  }

  const deleteProject = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Optimistic UI update
    setProjects(prev => prev.filter(p => p.id !== id))
    toast.success('Project deleted')

    const res = await deleteProjectAction(id)
    if (!res.success) {
      toast.error('Failed to delete project')
      fetchProjects() // Revert UI if DB fails
    } else {
      window.dispatchEvent(new Event('project_history_updated'))
      if (pathname.includes(id)) {
        router.push('/dashboard')
      }
    }
  }

  const syncHistory = () => {
    window.dispatchEvent(new Event('project_history_updated'))
  }

  const pinnedProjects = projects.filter(p => p.isPinned)
  const recentProjects = projects.filter(p => !p.isPinned)

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + 'y ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + 'mo ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + 'd ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + 'h ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + 'm ago'
    return 'Just now'
  }

  return {
    projects,
    pinnedProjects,
    recentProjects,
    isLoaded: !isLoadingHistory,
    togglePin,
    deleteProject,
    syncHistory,
    getTimeAgo
  }
}
