'use client'

import { useEffect, useState } from 'react'
import { Terminal, Code2, Sparkles, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMANDS = [
  { cmd: "npm create codewithchat-app my-saas", delay: 800 },
  { cmd: "cd my-saas && npm install", delay: 1500 },
  { cmd: "npx cwc add auth billing dashboard", delay: 1200 },
  { cmd: "npm run dev", delay: 800 },
  { cmd: "Ready on http://localhost:3000", delay: 3000, isSuccess: true },
]

export function HeroPreview() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (currentCommand >= COMMANDS.length) {
      // Loop back after some time
      timeout = setTimeout(() => {
        setCurrentCommand(0)
        setTypedText('')
      }, 3000)
      return () => clearTimeout(timeout)
    }

    const command = COMMANDS[currentCommand]
    
    if (command.isSuccess) {
      setTypedText(command.cmd)
      timeout = setTimeout(() => {
        setCurrentCommand(prev => prev + 1)
      }, command.delay)
      return () => clearTimeout(timeout)
    }

    if (!isTyping) {
      setIsTyping(true)
      setTypedText('')
    }

    if (typedText.length < command.cmd.length) {
      timeout = setTimeout(() => {
        setTypedText(command.cmd.slice(0, typedText.length + 1))
      }, 40) // typing speed
    } else {
      timeout = setTimeout(() => {
        setIsTyping(false)
        setCurrentCommand(prev => prev + 1)
      }, command.delay)
    }

    return () => clearTimeout(timeout)
  }, [currentCommand, typedText, isTyping])

  return (
    <div className="relative mx-auto mt-20 max-w-5xl w-full">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] md:h-[500px] md:w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] md:blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[200px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[80px]" />

      <div className="relative grid gap-8 md:grid-cols-5 items-center">
        {/* Terminal Window */}
        <div className="md:col-span-2 rounded-xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden ring-1 ring-white/10 relative z-20 md:translate-x-8 md:translate-y-12">
          {/* Terminal Header */}
          <div className="flex items-center px-4 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="mx-auto flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Terminal className="size-3.5" />
              <span>bash</span>
            </div>
          </div>
          
          {/* Terminal Body */}
          <div className="p-4 font-mono text-xs sm:text-sm min-h-[220px]">
            {COMMANDS.slice(0, currentCommand).map((cmd, i) => (
              <div key={i} className={cn("mb-2 flex items-start gap-2", cmd.isSuccess ? "text-green-400" : "text-muted-foreground")}>
                {!cmd.isSuccess && <span className="text-primary mt-0.5">❯</span>}
                {cmd.isSuccess && <CheckCircle2 className="size-4 mt-0.5" />}
                <span>{cmd.cmd}</span>
              </div>
            ))}
            {currentCommand < COMMANDS.length && (
              <div className="flex items-start gap-2 text-foreground">
                {!COMMANDS[currentCommand].isSuccess && <span className="text-primary mt-0.5">❯</span>}
                <span className="relative">
                  {typedText}
                  <span className="absolute -right-2 top-0.5 w-2 h-4 bg-primary animate-pulse" />
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Browser Mockup */}
        <div className="md:col-span-3 rounded-xl border border-border/60 bg-background/50 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-white/10 relative z-10">
          {/* Browser Header */}
          <div className="flex items-center px-4 py-3 border-b border-border/50 bg-muted/50 gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="w-3 h-3 rounded-full bg-border" />
            </div>
            <div className="flex-1 bg-background/80 rounded-md px-3 py-1.5 flex items-center gap-2 border border-border/50">
              <Code2 className="size-3.5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground truncate">localhost:3000/dashboard</div>
            </div>
          </div>
          
          {/* Browser Body / Animated UI Placeholder */}
          <div className="relative aspect-[16/10] bg-muted/10 w-full overflow-hidden group flex items-center justify-center">
            
            {/* Animated Skeleton UI to simulate a SaaS dashboard */}
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col gap-6 w-full h-full">
              {/* Header skeleton */}
              <div className="flex justify-between items-center w-full">
                <div className="w-32 h-6 bg-border/40 rounded-md animate-pulse" />
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-border/40 rounded-full animate-pulse" />
                  <div className="w-24 h-8 bg-primary/20 rounded-md animate-pulse" />
                </div>
              </div>
              
              <div className="flex-1 flex gap-6 w-full">
                {/* Sidebar skeleton */}
                <div className="hidden sm:flex flex-col gap-4 w-48">
                  <div className="w-full h-8 bg-border/30 rounded-md animate-pulse delay-75" />
                  <div className="w-full h-8 bg-border/20 rounded-md animate-pulse delay-100" />
                  <div className="w-full h-8 bg-border/20 rounded-md animate-pulse delay-150" />
                  <div className="w-full h-8 bg-border/20 rounded-md animate-pulse delay-200" />
                </div>
                
                {/* Main content skeleton */}
                <div className="flex-1 flex flex-col gap-4 w-full">
                  <div className="flex gap-4 w-full h-32">
                     <div className="flex-1 bg-border/20 rounded-xl animate-pulse delay-100" />
                     <div className="flex-1 bg-border/20 rounded-xl animate-pulse delay-200" />
                     <div className="flex-1 bg-border/20 rounded-xl animate-pulse delay-300" />
                  </div>
                  <div className="w-full flex-1 bg-border/20 rounded-xl animate-pulse delay-500" />
                </div>
              </div>
            </div>
            
            {/* Overlay Gradient to indicate generation */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent flex items-end justify-center pb-8 opacity-100 transition-opacity duration-1000">
               <div className="bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-5 py-2.5 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-primary shadow-xl shadow-primary/10">
                 <Sparkles className="size-4 animate-pulse" />
                 <span>AI is building your SaaS...</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
