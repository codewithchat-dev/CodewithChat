'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addProjectAction } from '@/app/actions/projects'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idea = searchParams.get('idea')
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!idea) {
      router.replace('/dashboard')
      return
    }

    if (hasStarted.current) return
    hasStarted.current = true

    const createProject = async () => {
      const toastId = toast.loading('Initializing workspace...')
      try {
        const tech = 'React + Tailwind'
        const platform = 'Website'
        const agent = 'Gemini 3.5 Flash'

        const res = await addProjectAction(idea, idea)
        if (res.success && res.data) {
          toast.success('Workspace created!', { id: toastId })
          router.replace(`/dashboard/project/${res.data.id}?tech=${encodeURIComponent(tech)}&platform=${encodeURIComponent(platform)}&agent=${encodeURIComponent(agent)}`)
        } else {
          toast.dismiss(toastId)
          toast.error('Failed to create project')
          router.replace('/dashboard')
        }
      } catch {
        toast.dismiss(toastId)
        toast.error('Something went wrong')
        router.replace('/dashboard')
      }
    }

    createProject()
  }, [idea, router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Loader2 className="size-10 animate-spin text-primary mb-6" />
      <h2 className="text-2xl font-semibold mb-2">Initializing workspace</h2>
      <p className="text-muted-foreground animate-pulse text-sm">Getting things ready for your idea...</p>
    </div>
  )
}

export default function ProjectBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
}
