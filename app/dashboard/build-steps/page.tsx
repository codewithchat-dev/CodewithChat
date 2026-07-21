'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { buildSteps } from '@/lib/data'

export default function BuildStepsPage() {
  const [completed, setCompleted] = useState<number[]>([])

  function toggle(id: number) {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const progress = Math.round((completed.length / buildSteps.length) * 100)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <PageHeader
        title="Build Steps"
        description="A step-by-step execution guide that takes you from an empty folder to a deployed product. Check off each step as you go."
      />

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {completed.length} of {buildSteps.length} steps complete
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="mt-3 h-1.5" />
      </div>

      <ol className="mt-8 space-y-4">
        {buildSteps.map((step) => {
          const isDone = completed.includes(step.id)
          return (
            <li
              key={step.id}
              className={cn(
                'rounded-xl border border-border bg-card p-6 transition-colors',
                isDone && 'border-foreground/20 bg-accent/40',
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  aria-pressed={isDone}
                  aria-label={`Mark step ${step.id} as ${isDone ? 'incomplete' : 'complete'}`}
                  className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                    isDone
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/40',
                  )}
                >
                  {isDone ? <Check className="size-4" /> : step.id}
                </button>

                <div className="flex-1">
                  <h2
                    className={cn(
                      'text-lg font-medium',
                      isDone && 'text-muted-foreground line-through',
                    )}
                  >
                    {step.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.summary}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {step.details.map((d) => (
                      <li key={d} className="flex gap-3 text-sm leading-relaxed">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tools:</span>
                    {step.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-medium">Need the right tool for a step?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the curated library with links and guidance on when to use each one.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/dashboard/tools">Open Tools Library</a>
        </Button>
      </div>
    </div>
  )
}
