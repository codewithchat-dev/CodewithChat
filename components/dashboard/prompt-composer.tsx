'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUp,
  Sparkles,
  Plus,
  Mic,
  MicOff,
  Code2,
  Monitor,
  Smartphone,
  Lock,
  ChevronDown,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { creditsProgress, creditsUsed, MAX_DAILY_CREDITS } from '@/lib/credits'
import { Spinner } from '@/components/ui/spinner'

interface PromptComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  loading?: boolean
  disabled?: boolean
  credits?: number
  maxCredits?: number
  agent?: string
  tech?: string
  platform?: string
  onAgentChange?: (agent: string) => void
  onTechChange?: (tech: string) => void
  onPlatformChange?: (platform: string) => void
  placeholder?: string
  compact?: boolean
  submitHint?: string
  showCreditsBar?: boolean
  requiresCredit?: boolean
  /** When true, input stays enabled after credits run out (e.g. project page Q&A). */
  allowInputWhenExhausted?: boolean
}

export function PromptComposer({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  credits = MAX_DAILY_CREDITS,
  maxCredits = MAX_DAILY_CREDITS,
  agent = 'Gemini 3.5 Flash',
  tech = 'Next.js + Supabase',
  platform = 'Website',
  onAgentChange,
  onTechChange,
  onPlatformChange,
  placeholder = 'Ask a question or request a change…',
  compact = false,
  submitHint,
  showCreditsBar = true,
  requiresCredit = true,
  allowInputWhenExhausted = false,
}: PromptComposerProps) {
  const [isListening, setIsListening] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null)

  const creditsExhausted = requiresCredit && credits <= 0
  const inputDisabled = disabled || loading || (creditsExhausted && !allowInputWhenExhausted)
  const used = creditsUsed(maxCredits, credits)
  const progress = creditsProgress(maxCredits, credits)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as Window & {
      SpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
        onerror: (() => void) | null
        onend: (() => void) | null
        start: () => void
        stop: () => void
      }
      webkitSpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
        onerror: (() => void) | null
        onend: (() => void) | null
        start: () => void
        stop: () => void
      }
    }
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onChange(value ? `${value} ${transcript}` : transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Voice recognition failed. Please try again.')
    }

    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
  }, [onChange, value])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      toast.info('Listening…')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!inputDisabled && value.trim()) onSubmit()
    }
  }

  return (
    <div className="relative w-full group">
      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 blur-sm opacity-70" />
      <div className="relative flex flex-col bg-card/90 backdrop-blur-sm border border-border hover:border-border/80 rounded-2xl shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 overflow-hidden">
        {creditsExhausted && (
          <div className="px-4 py-3 border-b border-amber-500/20 bg-amber-500/10 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <Zap className="size-4 text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Daily credits used up</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {allowInputWhenExhausted
                    ? 'You can still ask questions. Code updates need credits — upgrade to keep building.'
                    : 'You can still view your project. Upgrade to keep building with AI.'}
                </p>
              </div>
            </div>
            {showCreditsBar && (
              <div className="px-1">
                <Progress value={100} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground mt-1.5">{used} / {maxCredits} credits used</p>
              </div>
            )}
            <Button asChild size="sm" className="w-full h-8 text-xs">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </div>
        )}

        {!creditsExhausted && showCreditsBar && requiresCredit && (
          <div className="px-4 pt-3 pb-0">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1">
                <Zap className="size-3 text-amber-500 fill-amber-500" />
                {credits} credit{credits === 1 ? '' : 's'} left
              </span>
              <span>{used} / {maxCredits} used today</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          placeholder={
            creditsExhausted && !allowInputWhenExhausted
              ? 'Upgrade to continue chatting with AI…'
              : creditsExhausted
                ? 'Ask a question (code updates need credits)…'
                : placeholder
          }
          className={`${compact ? 'min-h-[88px]' : 'min-h-[120px]'} resize-none border-0 bg-transparent px-4 py-4 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60 shadow-none disabled:opacity-60`}
        />

        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            <input type="file" className="hidden" ref={fileInputRef} />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={inputDisabled}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full size-9 text-muted-foreground hover:text-foreground"
              title="Attach file"
            >
              <Plus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={inputDisabled}
              onClick={toggleListening}
              className={`rounded-full size-9 ${isListening ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-foreground'}`}
              title="Voice dictation"
            >
              {isListening ? <MicOff className="size-4 animate-pulse" /> : <Mic className="size-4" />}
            </Button>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={inputDisabled}
                  className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 hover:bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/50 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="size-3 text-primary" />
                  <span className="truncate max-w-[100px]">{agent}</span>
                  <ChevronDown className="size-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem onClick={() => onAgentChange?.('Gemini 3.5 Flash')}>
                  Gemini 3.5 Flash
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="justify-between">
                  <span>Gemini 1.5 Pro</span>
                  <Badge className="text-[9px] h-4">PRO</Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {onTechChange ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={inputDisabled}
                    className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 hover:bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/50 transition-colors disabled:opacity-50"
                  >
                    <Code2 className="size-3.5" />
                    <span className="truncate max-w-[120px]">{tech}</span>
                    <ChevronDown className="size-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2">
                  <DropdownMenuItem onClick={() => onTechChange('Next.js + Supabase')} className="cursor-pointer">
                    Next.js + Supabase
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                disabled
                className="hidden md:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-full border border-border/50"
              >
                <Code2 className="size-3.5" />
                <span className="truncate max-w-[120px]">{tech}</span>
              </button>
            )}

            {onPlatformChange ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    disabled={inputDisabled}
                    className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 hover:bg-muted/60 px-2.5 py-1.5 rounded-full border border-border/50 transition-colors disabled:opacity-50"
                  >
                    {platform === 'Website' ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                    <span>{platform}</span>
                    <ChevronDown className="size-3 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onPlatformChange('Website')}>
                    <Monitor className="mr-2 size-4" /> Website
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                type="button"
                disabled
                className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2.5 py-1.5 rounded-full border border-border/50"
              >
                {platform === 'Website' ? <Monitor className="size-3.5" /> : <Smartphone className="size-3.5" />}
                <span>{platform}</span>
              </button>
            )}
          </div>

          {creditsExhausted && !allowInputWhenExhausted ? (
            <Button asChild size="sm" className="rounded-full h-9 px-4 shrink-0 text-xs">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={onSubmit}
              disabled={inputDisabled || !value.trim()}
              className="rounded-full size-10 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground shrink-0"
              title={submitHint || 'Send'}
            >
              {loading ? <Spinner className="size-4" /> : <ArrowUp className="size-5" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
