import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import Link from 'next/link'
import { 
  Boxes, 
  Network, 
  ListChecks, 
  Sparkles,
  Code,
  Palette,
  ShieldCheck,
  Zap,
  GitBranch,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Features | CodewithChat',
  description: 'Explore the powerful AI-driven features that help you design, build, and deploy production-grade applications.',
}

const coreFeatures = [
  {
    icon: Boxes,
    title: 'SaaS Builder',
    description: 'Describe your product idea in plain English and watch the AI scaffold an entire Next.js application — complete with routing, database schemas, authentication, and responsive UI components.',
  },
  {
    icon: Network,
    title: 'System Design Mentor',
    description: 'Learn modern software architecture as you build. The AI explains database relations, API design patterns, caching strategies, and security best practices in real-time.',
  },
  {
    icon: ListChecks,
    title: 'Step-by-Step Build Guide',
    description: 'A detailed, interactive checklist that walks you through every phase — from initial setup and environment configuration to deployment and DNS mapping.',
  },
]

const technicalFeatures = [
  {
    icon: Code,
    title: 'Live Code Editor',
    description: 'A full Monaco-powered code editor embedded in your browser. Edit generated files, see syntax highlighting, and make changes that instantly reflect in the preview.',
  },
  {
    icon: Palette,
    title: 'Design Mode',
    description: 'Visually adjust layouts, colors, and typography without touching code. Drag components, resize panels, and tweak spacing using an intuitive design surface.',
  },
  {
    icon: ShieldCheck,
    title: 'Sandboxed Previews',
    description: 'Every project compiles in an isolated WebContainer sandbox. Preview your full-stack app including API routes, database queries, and authentication flows — all inside the browser.',
  },
  {
    icon: Zap,
    title: 'AI Chat Iterations',
    description: 'Refine your app through conversational AI. Ask the assistant to add features, fix bugs, change styles, or restructure components. Each message produces real code diffs.',
  },
  {
    icon: GitBranch,
    title: 'Version Control & Export',
    description: 'Track every AI-generated change with automatic versioning. Export your project as a ZIP archive or push directly to a private GitHub repository with one click.',
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/50">
          <AnimatedBackground />
          <div className="absolute left-1/4 top-1/3 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="absolute right-1/4 bottom-10 -z-10 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 relative z-10 text-center">
            <div className="mx-auto flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium w-fit mb-6 animate-pulse">
              <Sparkles className="size-3.5" />
              <span>Platform Capabilities</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Features Built for Builders
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Three focused tools and a suite of engineering capabilities to take you from an idea to a deployed, production-grade SaaS.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20 lg:py-28 mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Core Tools</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl">The three pillars of the CodewithChat experience.</p>
          
          <div className="grid gap-8 md:grid-cols-3">
            {coreFeatures.map((f, i) => (
              <div
                key={f.title}
                className="group p-8 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <f.icon className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Features Grid */}
        <section className="py-20 lg:py-28 bg-muted/20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Engineering Capabilities</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl">Advanced tools that make development feel like magic.</p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {technicalFeatures.map((f) => (
                <div key={f.title} className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                  <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 mb-4">
                    <f.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-foreground text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to build?</h2>
            <p className="text-muted-foreground mb-8">Start building your first production app in minutes — no experience required.</p>
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
