import { GraduationCap, Briefcase, Rocket, UserCheck, Code2 } from 'lucide-react'

const audiences = [
  {
    title: 'College Students & CS Grads',
    description: 'Perfect for Final Year Projects & Hackathons. Stop struggling with architecture and get a complete, runnable project blueprint in minutes.',
    icon: GraduationCap,
  },
  {
    title: 'Indie Hackers & Founders',
    description: 'Act as your Virtual CTO. Don\'t know where to start? We guide you on the exact tech stack, database, and AI models needed for your SaaS.',
    icon: Rocket,
  },
  {
    title: 'Freelancers & Devs',
    description: 'Save 10+ hours on client project setup. Get a step-by-step roadmap and code boilerplate generated instantly so you can focus on building.',
    icon: Code2,
  },
  {
    title: 'Product Managers',
    description: 'Visualize your ideas instantly. Use the Live Preview to create interactive prototypes of your new feature without waiting for a developer.',
    icon: Briefcase,
  },
]

export function TargetAudience() {
  return (
    <section className="border-t border-border bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who is <span className="text-primary">CodewithChat</span> for?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Unlike Cursor (a code editor) or Lovable (a UI builder), we are your <strong>Virtual CTO</strong>. We don't just write code—we design your startup's entire architecture and guide you step-by-step.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience) => (
            <div 
              key={audience.title} 
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <audience.icon className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{audience.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
