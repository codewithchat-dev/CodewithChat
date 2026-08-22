'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Brain,
  CheckCircle2,
  FileCode2,
  LayoutTemplate,
  Loader2,
  Search,
  Sparkles,
} from 'lucide-react'
import { z } from 'zod'

import { planSchema } from '@/lib/schema'

type Plan = z.infer<typeof planSchema>

export type ActivityStatus =
  | 'done'
  | 'active'
  | 'pending'

/**
 * Kept temporarily for compatibility.
 * New projects use previewFiles as the complete project.
 */
export type FileSource =
  | 'preview'
  | 'fullstack'

export interface BuildActivity {
  id: string

  icon:
    | 'search'
    | 'brain'
    | 'steps'
    | 'preview'
    | 'sparkles'

  label: string

  detail?: string

  status: ActivityStatus

  kind?:
    | 'default'
    | 'file-group'

  fileSource?: FileSource

  files?: string[]
}

// ─────────────────────────────────────────────────────────────
// FORMAT HELPERS
// ─────────────────────────────────────────────────────────────

export function formatBuildDuration(
  ms: number,
): string {
  const totalSeconds = Math.max(
    1,
    Math.floor(ms / 1000),
  )

  if (totalSeconds < 60) {
    return `${totalSeconds}s`
  }

  const minutes = Math.floor(
    totalSeconds / 60,
  )

  const seconds =
    totalSeconds % 60

  return seconds > 0
    ? `${minutes}m ${seconds}s`
    : `${minutes}m`
}

export function formatBuildDateTime(
  timestamp: number,
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  ).format(
    new Date(timestamp),
  )
}

// ─────────────────────────────────────────────────────────────
// PROJECT TYPE
// ─────────────────────────────────────────────────────────────

type ProjectKind =
  | 'streaming'
  | 'ecommerce'
  | 'dashboard'
  | 'portfolio'
  | 'blog'
  | 'social'
  | 'saas'
  | 'general'

function detectProjectKind(
  idea: string,
): ProjectKind {
  const text =
    idea.toLowerCase()

  if (
    /netflix|movie|movies|streaming|ott|tv show|series/.test(
      text,
    )
  ) {
    return 'streaming'
  }

  if (
    /ecommerce|e-commerce|shop|store|product|cart/.test(
      text,
    )
  ) {
    return 'ecommerce'
  }

  if (
    /dashboard|analytics|admin|management panel/.test(
      text,
    )
  ) {
    return 'dashboard'
  }

  if (
    /portfolio|resume|personal website/.test(
      text,
    )
  ) {
    return 'portfolio'
  }

  if (
    /blog|article|cms|news website/.test(
      text,
    )
  ) {
    return 'blog'
  }

  if (
    /social|chat|message|community/.test(
      text,
    )
  ) {
    return 'social'
  }

  if (
    /saas|subscription|software as a service/.test(
      text,
    )
  ) {
    return 'saas'
  }

  return 'general'
}

// ─────────────────────────────────────────────────────────────
// LOVABLE-STYLE PROGRESS COPY
// ─────────────────────────────────────────────────────────────

type GenerationProgress = {
  label: string
  message: string
}

function getGenerationProgress(
  idea: string,
  seconds: number,
  isUpdating: boolean,
): GenerationProgress {
  const kind =
    detectProjectKind(idea)

  // ─── ANALYZE ─────────────────────────────────────────

  if (seconds < 10) {
    return {
      label: isUpdating
        ? 'Understanding changes…'
        : 'Understanding your idea…',

      message: isUpdating
        ? 'Reviewing your requested changes and preparing an update that keeps the existing project structure and working features intact.'
        : 'Understanding your request, identifying the main screens and features, and deciding how to organize the project into clean reusable components.',
    }
  }

  // ─── STRUCTURE ───────────────────────────────────────

  if (seconds < 25) {
    if (kind === 'streaming') {
      return {
        label:
          'Planning streaming experience…',

        message:
          'Planning a cinematic streaming interface with a dark visual system, navigation, a featured hero area, reusable media cards, and organized content rows.',
      }
    }

    if (kind === 'ecommerce') {
      return {
        label:
          'Planning store experience…',

        message:
          'Structuring the storefront around product discovery, reusable product cards, navigation, category sections, responsive layouts, and clear shopping interactions.',
      }
    }

    if (kind === 'dashboard') {
      return {
        label:
          'Planning dashboard…',

        message:
          'Organizing the dashboard shell, navigation, reusable information cards, data sections, responsive layouts, and the main workflows users will interact with.',
      }
    }

    if (kind === 'portfolio') {
      return {
        label:
          'Planning portfolio…',

        message:
          'Structuring the portfolio around a strong hero section, projects, skills, experience, contact information, and a responsive visual hierarchy.',
      }
    }

    if (kind === 'blog') {
      return {
        label:
          'Planning content structure…',

        message:
          'Organizing the content experience with navigation, featured articles, reusable post cards, readable layouts, categories, and responsive article presentation.',
      }
    }

    if (kind === 'social') {
      return {
        label:
          'Planning social experience…',

        message:
          'Structuring the social interface around navigation, user content, reusable interaction components, messaging or community areas, and responsive behavior.',
      }
    }

    if (kind === 'saas') {
      return {
        label:
          'Planning SaaS experience…',

        message:
          'Designing the application structure around clear navigation, product workflows, reusable UI components, account areas, and responsive application states.',
      }
    }

    return {
      label:
        'Planning project structure…',

      message:
        'Planning the page hierarchy, reusable components, responsive layout, visual system, and application structure before assembling the complete project.',
    }
  }

  // ─── MAIN UI ──────────────────────────────────────────

  if (seconds < 45) {
    if (kind === 'streaming') {
      return {
        label:
          'Building cinematic UI…',

        message:
          'Creating the main streaming layout with the navigation, featured movie hero, horizontal content rows, reusable poster cards, and responsive desktop and mobile behavior.',
      }
    }

    if (kind === 'ecommerce') {
      return {
        label:
          'Building storefront UI…',

        message:
          'Creating the main storefront sections, product grids, reusable cards, navigation, calls to action, and layouts that adapt cleanly across screen sizes.',
      }
    }

    if (kind === 'dashboard') {
      return {
        label:
          'Building dashboard UI…',

        message:
          'Creating the dashboard layout, navigation, metric cards, content panels, reusable components, and responsive states for different screen sizes.',
      }
    }

    return {
      label:
        'Building interface…',

      message:
        'Creating the main pages and sections, building reusable components, applying the visual system, and making the interface responsive across desktop, tablet, and mobile.',
    }
  }

  // ─── INTERACTIONS ─────────────────────────────────────

  if (seconds < 70) {
    if (kind === 'streaming') {
      return {
        label:
          'Adding interactions…',

        message:
          'Adding search behavior, My List controls, card hover states, media-row interactions, realistic content data, poster imagery, and polished responsive details.',
      }
    }

    if (kind === 'ecommerce') {
      return {
        label:
          'Adding shopping interactions…',

        message:
          'Adding product interactions, navigation behavior, responsive states, useful empty and loading states, and the details needed to make the storefront feel complete.',
      }
    }

    return {
      label:
        'Adding interactions…',

      message:
        'Adding interactive states, navigation behavior, realistic content, responsive details, hover and focus states, and polished loading or empty experiences.',
    }
  }

  // ─── PROJECT FILES ────────────────────────────────────

  if (seconds < 95) {
    return {
      label:
        'Organizing project files…',

      message:
        'Organizing the generated application into the Vite project structure, connecting components and utilities, checking dependencies, and making sure local imports point to real files.',
    }
  }

  // ─── BACKEND / CONFIG ─────────────────────────────────

  if (seconds < 120) {
    const needsBackend =
      /auth|login|signup|sign up|database|supabase|storage|backend|account/.test(
        idea.toLowerCase(),
      )

    if (needsBackend) {
      return {
        label:
          'Preparing backend integration…',

        message:
          'Preparing the required environment configuration and backend integration files while checking authentication, data access, and project setup before the preview is updated.',
      }
    }

    return {
      label:
        'Checking project configuration…',

      message:
        'Checking the application entry files, package dependencies, Tailwind setup, TypeScript configuration, and generated source structure before preparing the preview.',
    }
  }

  // ─── FINAL VALIDATION ─────────────────────────────────

  return {
    label:
      'Finalizing project…',

    message:
      'Finishing the project by validating imports, entry files, dependencies, responsive behavior, and generated source files before sending the completed build to the live preview.',
  }
}

// ─────────────────────────────────────────────────────────────
// ICON
// ─────────────────────────────────────────────────────────────

function ActivityIcon({
  icon,
  status,
}: {
  icon: BuildActivity['icon']
  status: ActivityStatus
}) {
  if (status === 'active') {
    return (
      <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
    )
  }

  if (status === 'done') {
    return (
      <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
    )
  }

  const className =
    'size-4 shrink-0 text-muted-foreground'

  switch (icon) {
    case 'search':
      return (
        <Search
          className={className}
        />
      )

    case 'brain':
      return (
        <Brain
          className={className}
        />
      )

    case 'steps':
      return (
        <LayoutTemplate
          className={className}
        />
      )

    case 'preview':
      return (
        <FileCode2
          className={className}
        />
      )

    default:
      return (
        <Sparkles
          className={className}
        />
      )
  }
}

// ─────────────────────────────────────────────────────────────
// COMPLETED ACTIVITIES
// ─────────────────────────────────────────────────────────────

export function buildActivitiesFromPlan(
  plan: Plan | undefined,
  loading: boolean,
  idea: string,
  durationMs?: number | null,
  completedAt?: number | null,
  activeProgress?: GenerationProgress,
): BuildActivity[] {
  const activities: BuildActivity[] = []

  activities.push({
    id: 'analyze',

    icon: 'search',

    label:
      'Analyzed request',

    detail: idea
      ? `Building: ${idea.slice(
          0,
          80,
        )}${
          idea.length > 80
            ? '…'
            : ''
        }`
      : 'Understanding your request',

    status: 'done',
  })

  // ─── ACTIVE GENERATION ────────────────────────────────

  if (loading) {
    activities.push({
      id:
        'generation-active',

      icon: 'brain',

      label:
        activeProgress?.label ??
        'Planning project…',

      detail:
        activeProgress?.message ??
        'Generating the complete project before updating the live preview.',

      status: 'active',
    })

    return activities
  }

  // ─── OVERVIEW ─────────────────────────────────────────

  if (plan?.overview) {
    activities.push({
      id: 'overview',

      icon: 'brain',

      label:
        'Planned architecture',

      detail:
        plan.overview.length >
        120
          ? `${plan.overview.slice(
              0,
              120,
            )}…`
          : plan.overview,

      status: 'done',
    })
  }

  // ─── STEPS ────────────────────────────────────────────

  const steps =
    plan?.steps?.filter(
      step =>
        Boolean(step?.title),
    ) ?? []

  for (
    let index = 0;
    index < steps.length;
    index += 1
  ) {
    const step =
      steps[index]

    if (!step?.title) {
      continue
    }

    activities.push({
      id: `step-${index}`,

      icon: 'steps',

      label: step.title,

      detail:
        step.description
          ? step.description.length >
            100
            ? `${step.description.slice(
                0,
                100,
              )}…`
            : step.description
          : 'Completed',

      status: 'done',
    })
  }

  // ─── COMPLETE PROJECT FILES ───────────────────────────

  const projectFiles =
    plan?.previewFiles
      ?.filter(
        file =>
          Boolean(file?.path),
      )
      .map(
        file =>
          file.path,
      )
      .filter(
        (
          path,
        ): path is string =>
          Boolean(path),
      ) ?? []

  if (
    projectFiles.length > 0
  ) {
    activities.push({
      id: 'project-files',

      icon: 'preview',

      kind: 'file-group',

      fileSource:
        'preview',

      files:
        projectFiles,

      label: `Generated project (${projectFiles.length} file${
        projectFiles.length ===
        1
          ? ''
          : 's'
      })`,

      status: 'done',
    })
  }

  // ─── COMPLETE ─────────────────────────────────────────

  if (
    plan &&
    (
      projectFiles.length > 0 ||
      steps.length > 0
    )
  ) {
    const detailParts: string[] =
      []

    if (durationMs) {
      detailParts.push(
        `Worked for ${formatBuildDuration(
          durationMs,
        )}`,
      )
    }

    if (
      projectFiles.length > 0
    ) {
      detailParts.push(
        `${projectFiles.length} project file${
          projectFiles.length ===
          1
            ? ''
            : 's'
        }`,
      )
    }

    if (completedAt) {
      detailParts.push(
        formatBuildDateTime(
          completedAt,
        ),
      )
    }

    activities.push({
      id: 'finished',

      icon: 'sparkles',

      label:
        'Build complete',

      detail:
        detailParts.length >
        0
          ? detailParts.join(
              ' · ',
            )
          : 'Preview and project files are ready.',

      status: 'done',
    })
  }

  return activities
}

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────

interface BuildActivityFeedProps {
  plan?: Plan

  loading: boolean

  idea: string

  startedAt:
    | number
    | null

  durationMs:
    | number
    | null

  completedAt?:
    | number
    | null

  fallbackUpdatedAt?:
    | Date
    | string
    | null

  onOpenFile?: (
    path: string,
    source: FileSource,
  ) => void

  compact?: boolean
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

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
  /**
   * tick forces the UI to refresh every second.
   *
   * This does NOT touch Sandpack or the generated files.
   * It only updates the visible progress text/timer.
   */
  const [tick, setTick] =
    useState(0)

  useEffect(() => {
    if (!loading) {
      return
    }

    const interval =
      window.setInterval(
        () => {
          setTick(
            current =>
              current + 1,
          )
        },
        1000,
      )

    return () => {
      window.clearInterval(
        interval,
      )
    }
  }, [loading])

  // ───────────────────────────────────────────────────────────
  // ELAPSED TIME
  // ───────────────────────────────────────────────────────────

  const elapsedSeconds =
    loading && startedAt
      ? Math.max(
          0,
          Math.floor(
            (
              Date.now() -
              startedAt
            ) / 1000,
          ),
        )
      : 0

  const liveElapsed =
    loading && startedAt
      ? formatBuildDuration(
          Date.now() -
            startedAt,
        )
      : null

  const workedFor =
    !loading &&
    durationMs
      ? formatBuildDuration(
          durationMs,
        )
      : null

  // ───────────────────────────────────────────────────────────
  // LOVABLE-STYLE STATUS
  // ───────────────────────────────────────────────────────────

  const generationProgress =
    useMemo(() => {
      if (!loading) {
        return null
      }

      return getGenerationProgress(
        idea,
        elapsedSeconds,
        Boolean(plan),
      )
    }, [
      loading,
      idea,
      elapsedSeconds,
      plan,
      tick,
    ])

  // ───────────────────────────────────────────────────────────
  // ACTIVITIES
  // ───────────────────────────────────────────────────────────

  const activities =
    useMemo(
      () =>
        buildActivitiesFromPlan(
          plan,
          loading,
          idea,
          durationMs,
          completedAt,
          generationProgress ??
            undefined,
        ),
      [
        plan,
        loading,
        idea,
        durationMs,
        completedAt,
        generationProgress,
      ],
    )

  const completedTimestamp =
    completedAt ??
    (
      fallbackUpdatedAt
        ? new Date(
            fallbackUpdatedAt,
          ).getTime()
        : null
    )

  if (
    activities.length === 0
  ) {
    return null
  }

  const visibleActivities =
    activities.filter(
      activity =>
        activity.id !==
          'analyze' &&
        activity.id !==
          'overview' &&
        activity.id !==
          'finished',
    )

  // ───────────────────────────────────────────────────────────
  // MAIN SUMMARY PARAGRAPH
  // ───────────────────────────────────────────────────────────

  const summaryText =
    loading
      ? generationProgress?.message ??
        'Planning and generating your project...'
      : plan?.overview ||
        idea ||
        'Project ready.'

  return (
    <div
      className={
        compact
          ? 'overflow-hidden'
          : 'flex h-full flex-col overflow-y-auto'
      }
    >
      <div
        className={
          compact
            ? 'space-y-3'
            : 'space-y-6 p-4'
        }
      >
        {/* ─────────────────────────────────────
            SUMMARY
        ───────────────────────────────────── */}

        <div className="space-y-2">
          {(liveElapsed ||
            workedFor) && (
            <p className="text-xs font-medium text-muted-foreground">
              {loading
                ? `Working for ${liveElapsed}`
                : `Finished in ${workedFor}`}
            </p>
          )}

          <p className="text-sm leading-relaxed text-foreground">
            {summaryText}
          </p>

          {!loading &&
            completedTimestamp && (
              <p className="text-[11px] text-muted-foreground">
                Updated{' '}
                {formatBuildDateTime(
                  completedTimestamp,
                )}
              </p>
            )}
        </div>

        {/* ─────────────────────────────────────
            ACTIVITY CARDS
        ───────────────────────────────────── */}

        {visibleActivities.length >
          0 && (
          <div className="space-y-2">
            {visibleActivities.map(
              activity => (
                <div
                  key={
                    activity.id
                  }
                  className={`flex flex-col gap-2 rounded-xl border p-3 ${
                    activity.status ===
                    'active'
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-border/40 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ActivityIcon
                      icon={
                        activity.icon
                      }
                      status={
                        activity.status
                      }
                    />

                    <span className="text-xs font-medium text-foreground">
                      {
                        activity.label
                      }
                    </span>
                  </div>

                  {/* FILES */}

                  {activity.kind ===
                    'file-group' &&
                    activity.files &&
                    activity.files
                      .length >
                      0 && (
                      <div className="mt-1 flex max-h-52 flex-col gap-1.5 overflow-y-auto pl-7">
                        {activity.files.map(
                          path => (
                            <button
                              key={
                                path
                              }
                              type="button"
                              onClick={() =>
                                onOpenFile?.(
                                  path,
                                  'preview',
                                )
                              }
                              className="truncate text-left font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                            >
                              {
                                path
                              }
                            </button>
                          ),
                        )}
                      </div>
                    )}

                  {/* NORMAL DETAIL */}

                  {activity.detail &&
                    activity.kind !==
                      'file-group' && (
                      <p className="pl-7 text-[11px] leading-relaxed text-muted-foreground">
                        {
                          activity.detail
                        }
                      </p>
                    )}
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}