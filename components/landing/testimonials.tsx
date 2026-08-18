import { testimonials } from '@/lib/data'
import { UserRound } from 'lucide-react'

export function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-1/2 -z-10 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute inset-0 pattern-grid opacity-[0.02] pointer-events-none" />
      
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="max-w-2xl mb-12">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground">
            Trusted by people learning to build
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground text-lg">
            Developers use CodewithChat to turn ideas into shipped products.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="group flex flex-col justify-between rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:bg-card/90 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <blockquote className="text-sm leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                &quot;{t.quote}&quot;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
               <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted text-muted-foreground shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105">
              <UserRound className="size-6" />
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
