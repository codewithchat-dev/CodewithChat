'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUp, Sparkles, Plus, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth, useClerk } from '@clerk/nextjs'
import { toast } from 'sonner'
import { AnimatedBackground } from '@/components/landing/animated-background'

const PLACEHOLDER_PHRASES = [
  "Ask CodewithChat to build a SaaS dashboard...",
  "Ask CodewithChat to build an e-commerce store...",
  "Ask CodewithChat to build a portfolio website...",
  "Ask CodewithChat to build a healthcare scheduling app...",
  "Ask CodewithChat to build a social media clone..."
]

export function Hero() {
  const [idea, setIdea] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [placeholder, setPlaceholder] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { userId } = useAuth()
  const clerk = useClerk()
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setIdea(prev => prev ? `${prev} ${transcript}` : transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
          toast.error("Voice recognition failed. Please try again.")
        }
        
        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  // Typewriter effect for placeholder
  useEffect(() => {
    const currentPhrase = PLACEHOLDER_PHRASES[phraseIndex]
    const prefixLength = 20 // length of "Ask CodewithChat to "
    
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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        toast.info("Listening... Speak now.")
      } catch (err) {
        setIsListening(false)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.success(`Attached ${e.target.files[0].name}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!idea.trim()) return
    
    const url = `/dashboard/project-builder?idea=${encodeURIComponent(idea)}`
    if (userId) {
      router.push(url)
    } else {
      clerk.openSignIn({ forceRedirectUrl: url })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 min-h-[90vh] flex flex-col justify-center">
      {/* Background glowing effects */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <AnimatedBackground />
      
      <div className="mx-auto w-full max-w-4xl px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 space-y-4">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Build something Incredible
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto">
              Create production-ready apps and websites just by chatting with AI.
            </p>
          </div>
          
          <form 
            onSubmit={handleSubmit}
            className="relative w-full group"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-md transition-all group-hover:from-primary/30 group-hover:via-primary/20 group-hover:to-primary/30 opacity-70"></div>
            <div className="relative flex flex-col bg-card border border-border/60 hover:border-border rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 overflow-hidden">
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[140px] resize-none border-0 bg-transparent px-5 py-5 text-base md:text-lg focus-visible:ring-0 placeholder:text-muted-foreground/60 shadow-none"
              />
              
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-1.5">
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    disabled={!userId}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full size-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    title={!userId ? "Sign in to attach files" : "Attach file"}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    disabled={!userId}
                    onClick={toggleListening}
                    className={`rounded-full size-8 transition-colors ${isListening ? 'text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    title={!userId ? "Sign in to use voice dictation" : "Voice dictation"}
                  >
                    {isListening ? <MicOff className="size-4 animate-pulse" /> : <Mic className="size-4" />}
                  </Button>
                  <div className="ml-2 hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border/50">
                    <Sparkles className="size-3.5 text-primary" />
                    <span>CodewithChat v1.0</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full size-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all"
                  disabled={!idea.trim()}
                >
                  <ArrowUp className="size-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
