import { Boxes, Network, ListChecks } from 'lucide-react'

const features = [
  {
    icon: Boxes,
    title: 'SaaS Builder',
    description: 'Turn ideas into structured MVPs with the perfect tech stack.',
  },
  {
    icon: Network,
    title: 'Design Mentor',
    description: 'Learn modern system architecture, databases, and security.',
  },
  {
    icon: ListChecks,
    title: 'Build Guide',
    description: 'Step-by-step execution plan from setup to live deployment.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border/50 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute inset-0 -z-10 pattern-grid opacity-[0.02] pointer-events-none" />
      
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="max-w-2xl mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl text-foreground">
            Everything you need
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground text-lg">
            Three focused tools to transform your ideas into deployed products.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 hover:bg-card/90 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Subtle hover gradient inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <span className="relative flex size-12 items-center justify-center rounded-lg border border-border/60 bg-surface-elevated transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
                <feature.icon className="size-6 text-muted-foreground transition-colors group-hover:text-primary" />
              </span>
              <h3 className="relative mt-6 text-xl font-semibold transition-colors group-hover:text-foreground">{feature.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
