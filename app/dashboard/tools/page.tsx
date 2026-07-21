'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/page-header'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { tools } from '@/lib/data'

const categories = ['All', ...Array.from(new Set(tools.map((t) => t.category)))]

export default function ToolsPage() {
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = active === 'All' || tool.category === active
      const matchesQuery =
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.purpose.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [active, query])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-16 lg:pt-8 pb-8 md:px-6">
      <PageHeader
        title="Tools Library"
        description="A curated set of production-grade tools. For each one: what it does, when to reach for it, and a link to the official docs."
      />

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="pl-9"
            aria-label="Search tools"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                active === cat
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-muted-foreground">
          No tools match your search.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium">{tool.name}</h2>
                  <span className="mt-1 inline-block rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    {tool.category}
                  </span>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <p className="mt-4 text-sm leading-relaxed">{tool.purpose}</p>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  When to use it
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {tool.whenToUse}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
