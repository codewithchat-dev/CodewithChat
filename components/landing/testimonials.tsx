import { testimonials } from '@/lib/data'

export function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border">
      <div className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            Trusted by people learning to build
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Developers use CodewithChat to turn ideas into shipped products.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                &quot;{t.quote}&quot;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium">
                  {t.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <span className="text-sm">
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
