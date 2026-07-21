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
    <div
      className={
        compact
          ? 'overflow-hidden'
          : 'rounded-xl border border-border bg-card/50 overflow-hidden'
      }
    >
      <div
        className={`flex items-center justify-between gap-2 ${
          compact ? 'pb-2' : 'px-3 py-2 border-b border-border/60'
        }`}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-foreground">
            {loading ? 'Agent is working…' : 'Agent activity'}
          </span>
          {!compact && !loading && completedLabel && (
            <span className="text-[10px] text-muted-foreground truncate">{completedLabel}</span>
          )}
        </div>
        {(liveElapsed || workedFor) && (
          <span className="text-[10px] font-semibold text-primary tabular-nums shrink-0">
            {loading ? `Working ${liveElapsed}` : `Worked ${workedFor}`}
          </span>
        )}
      </div>

      <div className={compact ? 'space-y-2' : 'p-3 space-y-3'}>
        <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
          <div className="flex items-center min-w-max">
            {activities.map((activity, index) => {
              const isSelected = activity.id === resolvedSelectedId
              const isLast = index === activities.length - 1
              const circleSize = compact ? 'size-6' : 'size-7'
              const stepWidth = compact ? 'w-[56px]' : 'w-[68px]'

              return (
                <div key={activity.id} className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(activity.id)}
                    className={`flex flex-col items-center justify-center group`}
                    title={activity.label}
                  >
                    <div
                      className={`flex ${circleSize} items-center justify-center rounded-full border-2 bg-card transition-colors ${
                        activity.status === 'done'
                          ? 'border-emerald-500/60'
                          : activity.status === 'active'
                            ? 'border-primary'
                            : 'border-border'
                      } ${isSelected ? 'ring-2 ring-primary/30' : ''}`}
                    >
                      <ActivityIcon icon={activity.icon} status={activity.status} />
                    </div>
                  </button>
                  {!isLast && (
                    <div
                      className={`h-0.5 ${compact ? 'w-4 mb-4' : 'w-5 sm:w-7 mb-5'} shrink-0 rounded-full ${
                        activity.status === 'done' ? 'bg-emerald-500/50' : 'bg-border'
                      }`}
                      aria-hidden
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {showDetail && selectedActivity && (
          <div
            className={`rounded-lg border border-border/60 bg-muted/10 px-2.5 py-2 ${
              compact ? 'max-h-28 overflow-y-auto' : 'min-h-[52px] px-3 py-2.5'
            }`}
          >
            <p className="text-xs font-medium text-foreground leading-snug">{selectedActivity.label}</p>
            {selectedActivity.detail && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {selectedActivity.status === 'active' && liveElapsed
                  ? `Thought for ${liveElapsed}`
                  : selectedActivity.detail}
              </p>
            )}
            {selectedActivity.kind === 'file-group' && (
              <div className="mt-1.5">
                <FileGroupDetail activity={selectedActivity} onOpenFile={onOpenFile} />
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && workedFor && !compact && (
        <div className="px-3 py-2.5 border-t border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-0.5">
          <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            Worked for {workedFor} — steps, preview UI & project files
          </p>
          {completedLabel && (
            <p className="text-[10px] text-muted-foreground">{completedLabel}</p>
          )}
        </div>
      )}
    </div>
  )
}
