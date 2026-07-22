import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import { HowItWorks } from '@/components/landing/how-it-works'
import Link from 'next/link'
import { 
  Sparkles,
  ArrowRight,
  MessageSquare,
  Terminal,
  Rocket,
  PenTool,
  RefreshCw,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'How It Works | CodewithChat',
  description: 'See how CodewithChat transforms your ideas into deployed, production-grade applications in three simple steps.',
}

const detailedSteps = [
  {
    step: '01',
    icon: MessageSquare,
    title: 'Describe Your Vision',
    description: 'Open the Project Builder and type your idea in plain English — like talking to a senior developer. Describe the features, user flows, and design preferences you want.',
    example: '"Build me a SaaS dashboard with user auth, a billing page, and analytics charts"',
  },
  {
    step: '02',
    icon: PenTool,
    title: 'AI Designs the Architecture',
    description: 'The AI mentor analyzes your prompt and generates a full system design — database schemas (Prisma), API routes, page layouts, and component trees. It explains every decision.',
  },
  {
    step: '03',
    icon: Terminal,
    title: 'Code is Generated Live',
    description: 'Watch as real TypeScript, React components, CSS styling, and configuration files are created in real-time inside a sandboxed editor. Every file is fully visible and editable.',
  },
  {
    step: '04',
    icon: RefreshCw,
    title: 'Iterate with Chat',
    description: 'Don\'t like something? Just tell the AI. "Change the color scheme to dark mode", "Add a notifications dropdown", "Fix the mobile layout". Each message produces precise code changes.',
  },
  {
    step: '05',
    icon: Globe,
    title: 'Preview & Deploy',
    description: 'Preview your full-stack app inside the browser sandbox — including auth flows, database queries, and API calls. When ready, export to GitHub or deploy directly to Vercel.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/50">
          <AnimatedBackground />
          <div className="absolute left-1/3 top-1/4 -z-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute right-1/3 bottom-10 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
            <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400 text-xs font-medium w-fit mb-6 animate-pulse">
              <Sparkles className="size-3.5" />
              <span>Simple 5-Step Process</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              How It Works
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From a simple text prompt to a fully deployed SaaS application — here's exactly how CodewithChat builds your software.
            </p>
          </div>
        </section>

        {/* Interactive Demo (reuse landing component) */}
        <HowItWorks />

        {/* Detailed Steps */}
        <section className="py-20 lg:py-28 mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">The Full Journey</h2>
          <p className="text-muted-foreground mb-16 text-center max-w-2xl mx-auto">A detailed look at what happens from the moment you type your idea to launch day.</p>

          <div className="space-y-10">
            {detailedSteps.map((s) => (
              <div key={s.step} className="flex gap-6 group">
                <div className="flex flex-col items-center shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <s.icon className="size-5" />
                  </div>
                  <div className="w-px flex-1 bg-border/60 mt-2" />
                </div>
                <div className="pb-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Step {s.step}</span>
                  <h3 className="text-xl font-bold text-foreground mt-1 mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                  {'example' in s && (
                    <p className="mt-3 text-xs font-mono bg-muted/40 p-3 rounded-xl border border-border text-foreground/80 italic">{s.example}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center bg-muted/20">
          <div className="mx-auto max-w-2xl px-6">
            <Rocket className="size-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold tracking-tight mb-4">Try it yourself</h2>
            <p className="text-muted-foreground mb-8">The best way to understand the process is to experience it. Start with a free account.</p>
            <Button asChild size="lg" className="rounded-full h-14 px-10 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
              <Link href="/dashboard/project-builder">
                Start Building Now
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
