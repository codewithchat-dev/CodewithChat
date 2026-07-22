import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import { Templates } from '@/components/landing/templates'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Templates | CodewithChat',
  description: 'Browse starter templates for SaaS dashboards, e-commerce stores, AI chat interfaces, portfolios, and more. Click to build instantly.',
}

export default function TemplatesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/50">
          <AnimatedBackground />
          <div className="absolute left-1/4 top-1/3 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute right-1/4 bottom-10 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
            <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-500 dark:text-violet-400 text-xs font-medium w-fit mb-6 animate-pulse">
              <Sparkles className="size-3.5" />
              <span>Ready-Made Starters</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Start with a Template
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Don't start from scratch. Pick a professionally designed template and let the AI customize it to your exact vision.
            </p>
          </div>
        </section>

        {/* Templates Grid (reuse landing component) */}
        <Templates />
      </main>

      <SiteFooter />
    </div>
  )
}
