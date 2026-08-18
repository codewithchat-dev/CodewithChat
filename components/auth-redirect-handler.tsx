'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

export function AuthRedirectHandler() {
  const { userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only run when user just logged in
    if (!userId) return

    // Check if there's a pending idea from localStorage
    const pendingIdea = typeof window !== 'undefined' ? localStorage.getItem('pending_idea') : null
    
    if (pendingIdea) {
      // Clear the stored idea
      localStorage.removeItem('pending_idea')
      
      // Redirect to project builder with the idea
      const url = `/dashboard/project-builder?idea=${encodeURIComponent(pendingIdea)}`
      router.push(url)
    }
  }, [userId, router])

  return null
}
