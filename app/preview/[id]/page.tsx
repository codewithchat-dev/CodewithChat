'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SandpackProvider, SandpackLayout, SandpackPreview } from '@codesandbox/sandpack-react'
import { getProjectByIdAction } from '@/app/actions/projects'
import { planSchema } from '@/lib/schema'
import { buildInstantPreviewFiles } from '@/lib/preview-files'
import { z } from 'zod'
import { Spinner } from '@/components/ui/spinner'

export default function PreviewPage() {
  const params = useParams()
  const projectId = params.id as string
  const [localPlan, setLocalPlan] = useState<z.infer<typeof planSchema> | null>(null)
  const [loading, setLoading] = useState(true)
  const [tech, setTech] = useState('React + Tailwind') // default

  useEffect(() => {
    if (projectId) {
      getProjectByIdAction(projectId).then(res => {
        if (res.success && res.data && res.data.code) {
          try {
            setLocalPlan(JSON.parse(res.data.code))
          } catch (err) {
            console.error("Failed to parse project code:", err)
          }
        }
        setLoading(false)
      })
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Spinner className="size-8 text-primary" />
      </div>
    )
  }

  if (!localPlan) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-muted-foreground">
        No preview available for this project.
      </div>
    )
  }

  const isTypeScript = localPlan.previewFiles?.some(f => f?.path?.endsWith('.ts') || f?.path?.endsWith('.tsx')) || false
  const fullStackMap = Object.fromEntries(
    (localPlan.fullStackFiles ?? [])
      .filter(f => f?.path && f?.content)
      .map(f => [f!.path!.startsWith('/') ? f!.path! : `/${f!.path!}`, f!.content!]),
  )
  const previewFiles = buildInstantPreviewFiles(localPlan.previewFiles, fullStackMap, isTypeScript)
  const blocked = new Set(['@vercel/ai', '@supabase/ssr', '@supabase/auth-helpers-nextjs', 'next'])
  const safeDeps = Object.fromEntries(
    Object.entries(localPlan.dependencies || {}).filter(([name]) => !blocked.has(name)),
  )

  return (
    <div className="h-screen w-screen overflow-hidden bg-white relative">
      <style dangerouslySetInnerHTML={{ __html: `
        .sp-wrapper,
        .sp-wrapper .sp-layout,
        .sp-wrapper .sp-stack,
        .sp-wrapper .sp-preview-container,
        .sp-wrapper iframe,
        .sp-wrapper .sp-code-editor {
          height: 100% !important;
          min-height: 100% !important;
          max-height: 100% !important;
          flex: 1 !important;
        }
      `}} />
      <div className="absolute inset-0 w-full h-full sp-wrapper">
        <SandpackProvider
          template={/html/i.test(tech) ? 'static' : isTypeScript ? 'react-ts' : 'react'}
          theme="dark"
          files={previewFiles}
          options={{
            externalResources: /html/i.test(tech) ? [] : ['https://cdn.tailwindcss.com']
          }}
          customSetup={/html/i.test(tech) ? undefined : {
            dependencies: {
              'lucide-react': 'latest',
              clsx: 'latest',
              'tailwind-merge': 'latest',
              ...safeDeps,
            },
          }}
        >
          <SandpackLayout style={{ border: 'none', borderRadius: 0, height: '100%', flex: 1 }}>
            <SandpackPreview 
              showNavigator={false} 
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              style={{ height: '100%', minHeight: '100%' }} 
            />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  )
}
