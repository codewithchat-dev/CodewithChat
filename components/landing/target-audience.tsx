'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Briefcase, Rocket, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const audiences = [
  {
    title: 'College Students',
    description:
      'Build final-year projects and hackathon ideas with a clear architecture and working project blueprint.',
    icon: GraduationCap,
  },
  {
    title: 'Indie Hackers & Founders',
    description:
      'Get the right tech stack, database, AI tools, and architecture for your SaaS idea.',
    icon: Rocket,
  },
  {
    title: 'Freelancers & Developers',
    description:
      'Skip repetitive setup and get a ready roadmap and boilerplate to start building faster.',
    icon: Code2,
  },
  {
    title: 'Product Managers',
    description:
      'Turn product ideas into interactive prototypes and technical plans without waiting for development.',
    icon: Briefcase,
  },
]

export function TargetAudience() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % audiences.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="border-t border-border/50 bg-card/30 py-24 relative overflow-hidden">
      <div className="absolute inset-0 pattern-grid opacity-[0.02] pointer-events-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            Who is <span className="text-primary">CodewithChat</span> for?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We are your <strong>Virtual CTO</strong> to plan, build, and launch smarter </p>
        </div>
        
        <div className="relative mt-20 max-w-6xl mx-auto">
          {/* Horizontal Background Line (Desktop) */}
          <div className="absolute top-6 left-0 w-full h-1 bg-border/50 hidden lg:block -translate-y-1/2 rounded-full" />
          
          {/* Animated Progress Line (Desktop) */}
          <div 
            className="absolute top-6 left-0 h-1 bg-primary hidden lg:block -translate-y-1/2 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
            style={{ width: `${(activeIndex / (audiences.length - 1)) * 100}%` }} 
          />
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative z-10">
            {audiences.map((audience, i) => {
              const isActive = i === activeIndex
              const isPast = i <= activeIndex
              
              return (
                <div 
                  key={audience.title} 
                  className="relative flex flex-col items-center lg:items-start group" 
                  onClick={() => setActiveIndex(i)}
                >
                  {/* Timeline Node */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl border-4 flex items-center justify-center mb-6 transition-all duration-700 cursor-pointer relative z-20",
                    isActive ? "bg-primary border-primary/30 text-primary-foreground scale-110 shadow-lg shadow-primary/30" : 
                    isPast ? "bg-primary text-primary-foreground border-background" : 
                    "bg-card border-border/50 text-muted-foreground hover:border-primary/50"
                  )}>
                    <audience.icon className="size-5" />
                  </div>
                  
                  {/* Card Content */}
                  <div className={cn(
                    "bg-background border rounded-xl p-6 transition-all duration-700 w-full text-center lg:text-left cursor-pointer",
                    isActive ? "border-primary/40 shadow-xl shadow-primary/10 scale-105 bg-card/90" : "border-border/50 opacity-60 scale-95 hover:opacity-100 hover:border-border/60"
                  )}>
                    <h3 className={cn("mb-3 text-lg font-bold transition-colors", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {audience.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {audience.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
