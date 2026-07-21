'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Briefcase, Rocket, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % audiences.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="border-t border-border bg-card/30 py-24 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who is <span className="text-primary">CodewithChat</span> for?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We are your <strong>Virtual CTO</strong>. We don't just write code—we design your startup's entire architecture and guide you step-by-step from idea to launch.
          </p>
        </div>
        
        <div className="relative mt-20 max-w-6xl mx-auto">
          {/* Horizontal Background Line (Desktop) */}
          <div className="absolute top-6 left-0 w-full h-1 bg-border hidden lg:block -translate-y-1/2 rounded-full" />
          
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
                    "w-12 h-12 rounded-full border-4 flex items-center justify-center mb-6 transition-all duration-700 cursor-pointer relative z-20",
                    isActive ? "bg-primary border-primary/30 text-primary-foreground scale-110 shadow-lg shadow-primary/30" : 
                    isPast ? "bg-primary text-primary-foreground border-background" : 
                    "bg-card border-border text-muted-foreground hover:border-primary/50"
                  )}>
                    <audience.icon className="size-5" />
                  </div>
                  
                  {/* Card Content */}
                  <div className={cn(
                    "bg-background border rounded-2xl p-6 transition-all duration-700 w-full text-center lg:text-left cursor-pointer",
                    isActive ? "border-primary/50 shadow-xl shadow-primary/5 scale-105 bg-card" : "border-border/50 opacity-60 scale-95 hover:opacity-100 hover:border-border"
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
