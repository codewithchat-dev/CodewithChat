'use client'

import { useState } from 'react'
import { Sparkles, Monitor, Server, Database, TrendingUp, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

type Section = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  points: string[]
}

function buildDesign(idea: string): Section[] {
  const subject = idea.trim() || 'your application'
  return [
    {
      icon: Monitor,
      title: 'Frontend architecture',
      points: [
        'Next.js App Router with server components for data-heavy pages and client components only where you need interactivity.',
        'A shared component library (buttons, forms, dialogs) so the UI stays consistent.',
        'Route-level loading and error states so users never see a blank screen.',
        'Mobile-first layouts that scale up to tablet and desktop breakpoints.',
      ],
    },
    {
      icon: Server,
      title: 'Backend architecture',
      points: [
        `Server actions and route handlers expose the operations ${subject.toLowerCase()} needs.`,
        'A thin service layer holds business logic so it stays testable and reusable.',
        'Validate and sanitize every input at the boundary before it reaches the database.',
        'Background jobs handle slow work like sending email or processing uploads.',
      ],
    },
    {
      icon: Database,
      title: 'Database design',
      points: [
        'Model core entities first: users, the primary record, and the relationships between them.',
        'Use foreign keys and indexes on the columns you filter and join on most.',
        'Store a user_id on every user-owned row and scope all queries to it.',
        'Version schema changes with migrations so environments stay in sync.',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Scaling approach',
      points: [
        'Start simple — a single database and serverless functions handle early traffic fine.',
        'Add caching (Redis) in front of expensive or frequently read queries.',
        'Introduce read replicas and connection pooling when database load grows.',
        'Measure with analytics and tracing before optimizing anything.',
      ],
    },
    {
      icon: ShieldCheck,
      title: 'Security basics',
      points: [
        'Never trust the client — authorize every request on the server.',
        'Use managed auth and never store plaintext passwords.',
        'Keep secrets in environment variables, never in the codebase.',
        'Add rate limiting and bot protection on auth and public endpoints.',
      ],
    },
  ]
}

export default function SystemDesignPage() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [sections, setSections] = useState<Section[] | null>(null)

  function handleGenerate() {
    if (!idea.trim()) return
    setLoading(true)
    setSections(null)
    setTimeout(() => {
      setSections(buildDesign(idea))
      setLoading(false)
    }, 900)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-16 lg:pt-8 pb-8 md:px-6">
      <PageHeader
        title="System Design Mentor"
        description="Enter your SaaS idea and get an architecture breakdown covering frontend, backend, database, scaling, and security fundamentals."
      />

      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="idea">Describe your SaaS idea</Label>
            <Textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A collaborative document editor for remote teams with comments and version history."
              className="min-h-28 resize-none"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleGenerate} disabled={!idea.trim() || loading}>
              {loading ? (
                <>
                  <Spinner className="size-4" />
                  Designing...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate system design
                </>
              )}
            </Button>
          </div>
        </div>

        {!sections && !loading && (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sparkles className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Your system design will appear here</EmptyTitle>
                <EmptyDescription>
                  Describe your idea to get a clear, layered architecture overview.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}

        {loading && (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card text-muted-foreground">
            <Spinner className="size-6" />
            <p className="text-sm">Mapping out your architecture...</p>
          </div>
        )}

        {sections && (
          <div className="grid gap-6 lg:grid-cols-2">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-border">
                    <section.icon className="size-4" />
                  </span>
                  <h2 className="font-medium">{section.title}</h2>
                </div>
                <ul className="space-y-2.5">
                  {section.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
