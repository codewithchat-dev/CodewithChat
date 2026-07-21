'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addProjectAction } from '@/app/actions/projects'
import { getCreditsAction } from '@/app/actions/credits'
import Link from 'next/link'
import { Clock, Pin } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useProjectHistory } from '@/hooks/use-project-history'
import { Badge } from '@/components/ui/badge'
import { PromptComposer } from '@/components/dashboard/prompt-composer'
import { MAX_DAILY_CREDITS } from '@/lib/credits'

const PLACEHOLDER_PHRASES = [
  "Build a SaaS dashboard with Next.js...",
  "Build an e-commerce store...",
  "Build a portfolio website...",
  "Build a healthcare scheduling app...",
  "Build a social media clone..."
]

export default function DashboardPage() {
  const [idea, setIdea] = useState('')
  const [tech, setTech] = useState('Next.js + Supabase')
  const [platform, setPlatform] = useState('Website')
  const [agent, setAgent] = useState('Gemini 3.5 Flash')
  const [credits, setCredits] = useState(MAX_DAILY_CREDITS)
  const [placeholder, setPlaceholder] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  
  const { projects, pinnedProjects, togglePin, getTimeAgo } = useProjectHistory()

  useEffect(() => {
    getCreditsAction().then(res => {
      if (res.success) setCredits(res.credits)
    })
  }, [])

  // Typewriter effect for placeholder
  useEffect(() => {
    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex]
    const prefixLength = 6 // length of "Build "
    
    let timeout: NodeJS.Timeout
    
    if (isDeleting) {
      if (charIndex > prefixLength) {
        timeout = setTimeout(() => {
          setPlaceholder(currentPhrase.substring(0, charIndex - 1))
          setCharIndex(c => c - 1)
        }, 20) // super fast deletion
      } else {
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length)
      }
    } else {
      if (charIndex < currentPhrase.length) {
        timeout = setTimeout(() => {
          setPlaceholder(currentPhrase.substring(0, charIndex + 1))
          setCharIndex(c => c + 1)
        }, 40) // fast typing speed
      } else {
        // Pause at the end of the phrase
        timeout = setTimeout(() => {
          setIsDeleting(true)
        }, 1200) // shorter pause
      }
    }
    
    return () => clearTimeout(timeout)
  }, [charIndex, isDeleting, phraseIndex])

  const handleSubmit = async (attachedImage?: string | null) => {
    if (!idea.trim() && !attachedImage) return
    if (credits <= 0) {
      toast.error('Daily credits used up. Upgrade to start building.')
      return
    }
    const toastId = toast.loading('Initializing workspace...')
    try {
      const finalIdea = attachedImage ? `${idea}\n\n[IMAGE: ${attachedImage}]` : idea;
      
      const res = await addProjectAction(finalIdea, finalIdea)
      if (res.success && res.data) {
        toast.success('Workspace created!', { id: toastId })
        router.push(`/dashboard/project/${res.data.id}?tech=${encodeURIComponent(tech)}&platform=${encodeURIComponent(platform)}&agent=${encodeURIComponent(agent)}`)
      } else {
        toast.dismiss(toastId)
        toast.error('Failed to create project')
      }
    } catch {
      toast.dismiss(toastId)
      toast.error('Something went wrong')
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]"></div>
      
      <div className="w-full max-w-3xl flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 pt-16 md:pt-20">
        <h1 className="text-center text-3xl md:text-5xl font-semibold tracking-tight mb-8">
          What are you building today{user?.firstName ? `, ${user.firstName}` : ''}?
        </h1>
        
        <div className="w-full mb-16">
          <PromptComposer
            value={idea}
            onChange={setIdea}
            onSubmit={handleSubmit}
            credits={credits}
            maxCredits={MAX_DAILY_CREDITS}
            agent={agent}
            tech={tech}
            platform={platform}
            onAgentChange={setAgent}
            onTechChange={setTech}
            onPlatformChange={setPlatform}
            placeholder={placeholder}
            submitHint="Start building"
          />
        </div>

        {/* Recent Projects Dock */}
        <div className="w-full mt-auto">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="size-4" />
              Your Recent Generations
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {projects.slice(0, 3).map((project, i) => {
              // Create pseudo-random visual variations based on index
              const hue = (i * 137.5) % 360;
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/project/${project.id}`}
                  className="group flex flex-col rounded-xl border border-border bg-card/50 hover:bg-card transition-all hover:border-primary/30 hover:shadow-lg overflow-hidden"
                >
                  {/* Mock Visual Thumbnail */}
                  <div className="h-36 w-full bg-muted/20 border-b border-border/50 flex items-end justify-center overflow-hidden relative p-4 pb-0">
                    <button 
                      onClick={(e) => { e.preventDefault(); togglePin(project.id, e as any) }}
                      className={`absolute top-3 right-3 z-10 p-1.5 rounded-md transition-all ${
                        pinnedProjects.some(p => p.id === project.id) 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground/50 hover:text-foreground hover:bg-background/80 opacity-0 group-hover:opacity-100 backdrop-blur-sm'
                      }`}
                    >
                      <Pin className={`size-4 ${pinnedProjects.some(p => p.id === project.id) ? 'fill-primary/20' : ''}`} />
                    </button>
                    <div 
                      className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{ background: `radial-gradient(circle at 50% 0%, hsl(${hue}, 70%, 50%), transparent)` }} 
                    />
                    <div className="w-full h-[90%] bg-background/95 backdrop-blur rounded-t-lg shadow-sm border border-border/60 border-b-0 flex flex-col pt-2.5 px-3 transform group-hover:-translate-y-1 transition-transform duration-300">
                      {/* Fake browser dots */}
                      <div className="flex gap-1.5 mb-3">
                        <div className="size-2 rounded-full bg-red-500/40" />
                        <div className="size-2 rounded-full bg-yellow-500/40" />
                        <div className="size-2 rounded-full bg-emerald-500/40" />
                      </div>
                      {/* Fake content blocks */}
                      <div className="w-1/3 h-2 bg-muted rounded-full mb-3" />
                      <div className="w-3/4 h-2 bg-muted/60 rounded-full mb-2" />
                      <div className="w-1/2 h-2 bg-muted/60 rounded-full" />
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-sm truncate text-foreground">{project.title}</h3>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium tracking-wider uppercase bg-primary/10 text-primary hover:bg-primary/20 border-0">
                        App
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {project.prompt}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                      <span>{getTimeAgo(project.updatedAt)}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-primary" />
                        <span>React + TS</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            {projects.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed rounded-xl border-border/60 bg-muted/10">
                <p className="text-sm text-muted-foreground">No projects yet. Build your first app above!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
