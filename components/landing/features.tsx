import { Boxes, Network, ListChecks } from 'lucide-react'

const features = [
  {
    icon: Boxes,
    title: 'SaaS Project Builder',
    description:
      'Describe your idea and get a clear problem statement, MVP scope, feature breakdown, and a recommended stack tailored to your skill level.',
  },
  {
    icon: Network,
    title: 'System Design Mentor',
    description:
      'Understand how the pieces fit together — frontend and backend architecture, database design, scaling, and security fundamentals.',
  },
  {
    icon: ListChecks,
    title: 'Step-by-step Build Guide',
    description:
      'Follow a structured plan from setup to deployment, with beginner-friendly explanations and the right tool for each step.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Everything you need to go from idea to launch
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Three focused tools that work together to teach you how real software
            gets built.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-lg border border-border">
                <feature.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
