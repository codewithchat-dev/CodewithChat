'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Terminal, Sparkles, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const steps = [
  {
    id: 1,
    title: 'Describe your idea',
    description: 'Just chat in plain English. No jargon.',
    icon: MessageSquare,
  },
  {
    id: 2,
    title: 'AI generates code',
    description: 'Watch your app build line-by-line.',
    icon: Terminal,
  },
  {
    id: 3,
    title: 'Deploy & Launch',
    description: 'One click to a production-ready URL.',
    icon: Sparkles,
  },
]

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          setActiveStep((prev) => (prev % 3) + 1)
          return 0
        }
        return oldProgress + 2.5 // Updates every 100ms, reaches 100% in 4000ms
      })
    }, 100)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="how-it-works" className="border-b border-border bg-muted/10 relative overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            From prompt to production
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            See how a simple idea transforms into a working SaaS in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Step Indicators */}
          <div className="flex flex-col gap-6">
            {steps.map((step) => {
              const isActive = activeStep === step.id
              const isPast = activeStep > step.id
              return (
                <div 
                  key={step.id}
                  onClick={() => {
                    setActiveStep(step.id)
                    setProgress(0)
                  }}
                  className={cn(
                    "relative flex items-start gap-5 p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden group",
                    isActive ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5" : "border-border/50 bg-card hover:bg-muted/50 hover:border-border"
                  )}
                >
                  {/* Progress bar background for active step */}
                  {isActive && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-100 ease-linear" 
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  
                  <div className={cn(
                    "flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full border transition-colors",
                    isActive ? "bg-primary text-primary-foreground border-primary" : 
                    isPast ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border group-hover:bg-primary/5"
                  )}>
                    {isPast ? <CheckCircle2 className="size-6" /> : <step.icon className="size-6" />}
                  </div>
                  <div>
                    <h3 className={cn("text-xl font-semibold mb-2 transition-colors", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                      {step.title}
                    </h3>
                    <p className={cn("text-sm transition-colors", isActive ? "text-muted-foreground" : "text-muted-foreground/60")}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Side: Visual Representation */}
          <div className="relative h-[400px] w-full rounded-2xl border border-border/50 bg-card overflow-hidden shadow-2xl flex items-center justify-center p-6 lg:ml-6">
            {/* Background grids */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Visuals based on active step */}
            <div className="relative z-10 w-full max-w-sm transition-all duration-500">
              
              {activeStep === 1 && (
                <div className="bg-background border border-border rounded-xl p-4 shadow-xl animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex gap-3 items-center border-b border-border pb-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="size-4 text-primary" />
                    </div>
                    <div className="text-sm font-medium">CodewithChat</div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-mono text-foreground animate-typing inline-block overflow-hidden whitespace-nowrap">
                      "Build an e-commerce dashboard..."
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="bg-[#1e1e1e] border border-border rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                   <div className="flex items-center px-4 py-3 border-b border-white/10 bg-black/40 gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500" />
                     <div className="w-3 h-3 rounded-full bg-yellow-500" />
                     <div className="w-3 h-3 rounded-full bg-green-500" />
                     <span className="text-xs text-white/50 ml-2 font-mono">terminal</span>
                   </div>
                   <div className="p-5 font-mono text-sm text-green-400 space-y-3">
                     <div className="animate-in fade-in duration-500 delay-100 fill-mode-both">❯ Installing dependencies...</div>
                     <div className="animate-in fade-in duration-500 delay-300 fill-mode-both text-white/70">✔ React, Next.js, Tailwind</div>
                     <div className="animate-in fade-in duration-500 delay-500 fill-mode-both">❯ Generating UI components...</div>
                     <div className="animate-in fade-in duration-500 delay-700 fill-mode-both text-white/70">✔ Navbar, Sidebar, Table</div>
                     <div className="animate-in fade-in duration-500 delay-1000 fill-mode-both">❯ Success! App is ready.</div>
                   </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-500">
                   <div className="flex items-center px-3 py-2.5 border-b border-border bg-muted/50 gap-3">
                     <div className="flex gap-1.5 ml-1">
                       <div className="w-3 h-3 rounded-full bg-border/80" />
                       <div className="w-3 h-3 rounded-full bg-border/80" />
                       <div className="w-3 h-3 rounded-full bg-border/80" />
                     </div>
                     <div className="flex-1 bg-background rounded-md text-xs text-muted-foreground px-3 py-1.5 font-mono border border-border/50 truncate text-center mr-12">
                       myapp.codewithchat.com
                     </div>
                   </div>
                   <div className="p-4 bg-muted/10 aspect-[4/3] flex flex-col gap-4">
                     <div className="w-full h-10 bg-primary/10 rounded-lg animate-pulse border border-primary/20" />
                     <div className="flex gap-4 h-full">
                       <div className="w-1/3 h-full bg-border/20 rounded-lg animate-pulse" />
                       <div className="flex-1 bg-border/20 rounded-lg animate-pulse" />
                     </div>
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-typing {
          animation: typing 2s steps(40, end);
        }
      `}} />
    </section>
  )
}
