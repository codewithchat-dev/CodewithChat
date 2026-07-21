import { testimonials } from '@/lib/data'

export function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      
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
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <blockquote className="text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                &quot;{t.quote}&quot;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary font-bold shadow-sm transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  {t.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <span className="text-sm">
                  <span className="block font-semibold text-foreground">{t.name}</span>
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
