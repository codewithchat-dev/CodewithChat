'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Brain,
  CheckCircle2,
  FileCode2,
  FolderTree,
  LayoutTemplate,
  ListChecks,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react'
import { z } from 'zod'
import { planSchema } from '@/lib/schema'

type Plan = z.infer<typeof planSchema>

export type ActivityStatus = 'done' | 'active' | 'pending'
export type FileSource = 'preview' | 'fullstack'

export interface BuildActivity {
  id: string
  icon: 'search' | 'brain' | 'plan' | 'steps' | 'preview' | 'project' | 'sparkles'
  label: string
  detail?: string
  status: ActivityStatus
  kind?: 'default' | 'file-group'
  fileSource?: FileSource
  files?: string[]
}

export function formatBuildDuration(ms: number): string {
  const totalSeconds = Math.max(1, Math.floor(ms / 1000))
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}

export function formatBuildDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function formatDuration(ms: number): string {
  return formatBuildDuration(ms)
}

function ActivityIcon({ icon, status }: { icon: BuildActivity['icon']; status: ActivityStatus }) {
  if (status === 'active') {
    return <Loader2 className="size-4 text-primary shrink-0 animate-spin" />
  }
  if (status === 'done') {
    return <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
  }

  const className = 'size-4 text-muted-foreground shrink-0'
  switch (icon) {
    case 'search':
      return <Search className={className} />
    case 'brain':
      return <Brain className={className} />
    case 'plan':
      return <LayoutTemplate className={className} />
    case 'steps':
      return <ListChecks className={className} />
    case 'preview':
      return <FileCode2 className={className} />
    case 'project':
      return <FolderTree className={className} />
    default:
      return <Sparkles className={className} />
  }
}

export function buildActivitiesFromPlan(
  plan: Plan | undefined,
  loading: boolean,
  idea: string,
  durationMs?: number | null,
  completedAt?: number | null,
): BuildActivity[] {
  const items: BuildActivity[] = []

  items.push({
    id: 'analyze',
    icon: 'search',
    label: 'Analyzed request',
    detail: idea ? `Building: ${idea.slice(0, 80)}${idea.length > 80 ? '…' : ''}` : 'Understanding your idea',
    status: 'done',
  })

  if (plan?.overview) {
    items.push({
      id: 'overview',
      icon: 'brain',
      label: 'Planned architecture',
      detail: plan.overview.length > 100 ? `${plan.overview.slice(0, 100)}…` : plan.overview,
      status: 'done',
    })
  } else if (loading) {
    items.push({
      id: 'overview-active',
      icon: 'brain',
      label: 'Planning architecture…',
      status: 'active',
    })
  }

  const steps = plan?.steps?.filter(Boolean) ?? []
  steps.forEach((step, index) => {
    if (!step?.title) return
    const isLast = index === steps.length - 1
    const isActive = loading && isLast && !step.description
    items.push({
      id: `step-${index}`,
      icon: 'steps',
      label: step.title,
      detail: isActive ? 'Writing instructions…' : 'Completed',
      status: isActive ? 'active' : 'done',
    })
  })

  if (loading && steps.length === 0 && plan?.overview) {
    items.push({
      id: 'steps-active',
      icon: 'steps',
      label: 'Generating build steps…',
      status: 'active',
    })
  }

  const previewFiles = plan?.previewFiles?.filter(f => f?.path).map(f => f.path!) ?? []
  if (previewFiles.length > 0) {
    items.push({
      id: 'preview-files',
      icon: 'preview',
      kind: 'file-group',
      fileSource: 'preview',
      files: previewFiles,
      label: `Building preview (${previewFiles.length} file${previewFiles.length === 1 ? '' : 's'})`,
      status: loading && !plan?.fullStackFiles?.length ? 'active' : 'done',
    })
  } else if (loading && steps.length > 0) {
    items.push({
      id: 'preview-active',
      icon: 'preview',
      label: 'Building preview UI…',
      status: 'active',
    })
  }

  const fullStackFiles = plan?.fullStackFiles?.filter(f => f?.path).map(f => f.path!) ?? []
  if (fullStackFiles.length > 0) {
    items.push({
      id: 'project-files',
      icon: 'project',
      kind: 'file-group',
      fileSource: 'fullstack',
      files: fullStackFiles,
      label: `Scaffolding project (${fullStackFiles.length} files)`,
      status: loading ? 'active' : 'done',
    })
  } else if (loading && previewFiles.length > 0) {
    items.push({
      id: 'project-active',
      icon: 'project',
      label: 'Scaffolding full project…',
      status: 'active',
    })
  }

  if (!loading && (steps.length > 0 || previewFiles.length > 0)) {
    const previewCount = previewFiles.length
    const projectCount = fullStackFiles.length
    let detail = 'Preview and project files are ready'
    if (durationMs && completedAt) {
      const parts = [`Worked for ${formatBuildDuration(durationMs)}`]
      if (previewCount > 0) parts.push(`${previewCount} preview file${previewCount === 1 ? '' : 's'}`)
      if (projectCount > 0) parts.push(`${projectCount} project files`)
      parts.push(formatBuildDateTime(completedAt))
      detail = parts.join(' · ')
    }
    items.push({
      id: 'finished',
      icon: 'sparkles',
      label: 'Build complete',
      detail,
      status: 'done',
    })
  }

  return items
}

function shortActivityLabel(label: string): string {
  return label
    .replace(/^Step \d+:\s*/i, '')
    .replace(/^Building preview \(\d+ files?\)$/i, 'Preview')
    .replace(/^Scaffolding project \(\d+ files?\)$/i, 'Project')
    .replace('Analyzed request', 'Analyze')
    .replace('Planned architecture', 'Plan')
    .replace('Build complete', 'Done')
    .slice(0, 28)
}

function FileGroupDetail({
  activity,
  onOpenFile,
}: {
  activity: BuildActivity
  onOpenFile?: (path: string, source: FileSource) => void
}) {
  const files = activity.files ?? []

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden">
      {files.map(path => (
        <button
          key={path}
          type="button"
          onClick={() => onOpenFile?.(path, activity.fileSource ?? 'preview')}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs font-mono text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors border-b border-border/40 last:border-b-0"
        >
          <FileCode2 className="size-3 shrink-0 opacity-60" />
          <span className="truncate">{path}</span>
        </button>
      ))}
      <p className="text-[10px] text-muted-foreground px-2.5 py-1.5">Click a file to open in Code tab</p>
    </div>
  )
}

interface BuildActivityFeedProps {
  plan?: Plan
  loading: boolean
  idea: string
  startedAt: number | null
  durationMs: number | null
  completedAt?: number | null
  fallbackUpdatedAt?: Date | string | null
  onOpenFile?: (path: string, source: FileSource) => void
  /** Tighter layout when pinned above the chat input */
  compact?: boolean
}

export function BuildActivityFeed({
  plan,
  loading,
  idea,
  startedAt,
  durationMs,
  completedAt = null,
  fallbackUpdatedAt = null,
  onOpenFile,
  compact = false,
}: BuildActivityFeedProps) {
  const [, setTick] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [loading])

  const activities = useMemo(
    () => buildActivitiesFromPlan(plan, loading, idea, durationMs, completedAt),
    [plan, loading, idea, durationMs, completedAt],
  )

  const liveElapsed =
    loading && startedAt ? formatDuration(Date.now() - startedAt) : null
  const workedFor = !loading && durationMs ? formatDuration(durationMs) : null
  const completedLabel = completedAt
    ? formatBuildDateTime(completedAt)
    : fallbackUpdatedAt
      ? formatBuildDateTime(new Date(fallbackUpdatedAt).getTime())
      : null

  const activeIndex = activities.findIndex(a => a.status === 'active')
  const defaultSelectedId =
    activeIndex >= 0 ? activities[activeIndex]?.id : activities[activities.length - 1]?.id ?? null
  const resolvedSelectedId = selectedId ?? defaultSelectedId
  const selectedActivity = activities.find(a => a.id === resolvedSelectedId) ?? activities[activities.length - 1]

  if (activities.length === 0) return null

  const showDetail =
    selectedActivity &&
    (selectedActivity.kind === 'file-group' ||
      selectedActivity.status === 'active' ||
      !compact)

  return (
    <div className={compact ? 'overflow-hidden' : 'h-full flex flex-col overflow-y-auto'}>
      <div className={compact ? 'space-y-3' : 'p-4 space-y-6'}>
        
        {/* Top Header & Paragraph */}
        <div className="space-y-3">
          {(liveElapsed || workedFor) && (
            <p className="text-xs font-medium text-muted-foreground">
              {loading ? `Thought for ${liveElapsed}` : `Finished in ${workedFor}`}
            </p>
          )}
          <p className="text-sm text-foreground leading-relaxed">
            {plan?.overview || (loading ? "Thinking about how to build this..." : idea || "Understanding your request...")}
          </p>
        </div>

        {/* Activity Blocks */}
        <div className="space-y-2">
          {activities
            .filter(a => a.id !== 'analyze' && a.id !== 'overview' && a.id !== 'finished' && a.id !== 'overview-active')
            .map((activity) => (
            <div 
              key={activity.id} 
              className={`rounded-xl border border-border/40 p-3 flex flex-col gap-2 ${
                activity.status === 'active' ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <ActivityIcon icon={activity.icon} status={activity.status} />
                <span className="text-xs font-medium text-foreground">{activity.label}</span>
              </div>
              
              {activity.kind === 'file-group' && activity.files && activity.files.length > 0 && (
                <div className="mt-1 flex flex-col gap-1.5 pl-7">
                  {activity.files.map(path => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => onOpenFile?.(path, activity.fileSource ?? 'preview')}
                      className="text-left text-xs font-mono text-muted-foreground hover:text-primary transition-colors truncate"
                    >
                      {path}
                    </button>
                  ))}
                </div>
              )}

              {activity.detail && activity.kind !== 'file-group' && (
                <p className="text-[11px] text-muted-foreground pl-7">
                  {activity.status === 'active' && liveElapsed && !activity.detail.includes('Thinking')
                    ? `Working...`
                    : activity.detail}
                </p>
              )}
            </div>
          ))}
        </div>
        
      </div>
    </div>
  )
}
