const steps = [
  {
    step: '01',
    title: 'Describe your idea',
    description:
      'Tell the mentor what you want to build and your experience level. No jargon required.',
  },
  {
    step: '02',
    title: 'Get a structured plan',
    description:
      'Receive a scoped MVP, a recommended stack, and a system design overview you can actually follow.',
  },
  {
    step: '03',
    title: 'Build and deploy',
    description:
      'Work through the step-by-step guide and ship a production-ready app with the right tools.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            A simple loop that takes you from a rough idea to a deployed product.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="bg-card p-8">
              <span className="font-mono text-sm text-muted-foreground">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
