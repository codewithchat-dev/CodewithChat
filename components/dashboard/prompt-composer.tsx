'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUp,
  Plus,
  Mic,
  MicOff,
  X,
  ChevronDown,
  Hammer,
  ClipboardList,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'

interface PromptComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (attachedImage?: string | null) => void
  loading?: boolean
  disabled?: boolean
  placeholder?: string
  compact?: boolean
  submitHint?: string

  /** Current composer mode */
  // mode?: 'build' | 'plan'

  /** Called when Build / Plan mode changes */
  // onModeChange?: (mode: 'build' | 'plan') => void
}

export function PromptComposer({
  value,
  onChange,
  onSubmit,
  loading = false,
  disabled = false,
  placeholder = 'Ask a question or request a change…',
  compact = false,
  submitHint,
  // mode = 'build',
  // onModeChange,
}: PromptComposerProps) {
  const [isListening, setIsListening] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [mode, setMode] = useState<'build' | 'plan'>('build')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const recognitionRef = useRef<{
    start: () => void
    stop: () => void
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const w = window as Window & {
      SpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        onresult: (
          event: {
            results: {
              [index: number]: {
                [index: number]: {
                  transcript: string
                }
              }
            }
          }
        ) => void
        onerror: (() => void) | null
        onend: (() => void) | null
        start: () => void
        stop: () => void
      }
      webkitSpeechRecognition?: new () => {
        continuous: boolean
        interimResults: boolean
        onresult: (
          event: {
            results: {
              [index: number]: {
                [index: number]: {
                  transcript: string
                }
              }
            }
          }
        ) => void
        onerror: (() => void) | null
        onend: (() => void) | null
        start: () => void
        stop: () => void
      }
    }

    const SpeechRecognitionCtor =
      w.SpeechRecognition || w.webkitSpeechRecognition

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

      if (!disabled && !loading && (value.trim() || attachedImage)) {
        onSubmit(attachedImage)
        setAttachedImage(null)
      }
    }
  }

  const handleSubmitClick = () => {
    if (!value.trim() && !attachedImage) return

    onSubmit(attachedImage)
    setAttachedImage(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }

    // Max 4MB
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 4MB.')
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      setAttachedImage(e.target?.result as string)
    }

    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="relative w-full">
      <div
        className="
          relative flex flex-col
          bg-card/50
          backdrop-blur-xl
          border border-white/10
          hover:border-white/20
          rounded-2xl
          transition-all duration-300
          focus-within:border-white/30
          focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.4)]
          shadow-[0_2px_20px_rgba(0,0,0,0.3)]
          overflow-hidden
        "
      >
        {/* Image Preview */}
        {attachedImage && (
          <div className="px-4 pt-4 flex gap-2">
            <div className="relative inline-block group/img">
              <img
                src={attachedImage}
                alt="Attached preview"
                className="
                  h-16 w-16
                  object-cover
                  rounded-md
                  border border-border/50
                  shadow-sm
                "
              />

              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="
                  absolute -top-2 -right-2
                  bg-background
                  border border-border
                  text-muted-foreground
                  hover:text-foreground
                  rounded-full
                  p-1
                  shadow-sm
                  opacity-0
                  group-hover/img:opacity-100
                  transition-opacity
                "
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder={placeholder}
          className={`
            ${
              compact
                ? attachedImage
                  ? 'min-h-[40px]'
                  : 'min-h-[88px]'
                : attachedImage
                  ? 'min-h-[60px]'
                  : 'min-h-[120px]'
            }
            max-h-[300px]
            overflow-y-auto
            resize-none
            border-0
            bg-transparent
            px-4
            py-4
            text-sm
            focus-visible:ring-0
            placeholder:text-foreground/60
            shadow-none
            disabled:opacity-60
          `}
        />

        {/* Bottom Controls */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          {/* Left controls */}
          <div className="flex items-center gap-1 min-w-0">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* Attach */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || loading}
              onClick={() => fileInputRef.current?.click()}
              className="
                rounded-full
                size-9
                text-muted-foreground
                hover:text-foreground
              "
              title="Attach image"
            >
              <Plus className="size-4" />
            </Button>

            {/* Voice */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled || loading}
              onClick={toggleListening}
              className={`
                rounded-full
                size-9
                ${
                  isListening
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
              title="Voice dictation"
            >
              {isListening ? (
                <MicOff className="size-4 animate-pulse" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>

            {/* Build / Plan Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={disabled || loading}
                  className="
                    flex items-center
                    gap-1.5
                    text-[11px]
                    font-medium
                    text-muted-foreground
                    bg-muted/30
                    hover:bg-muted/60
                    px-2.5
                    py-1.5
                    rounded-full
                    border border-border/50
                    transition-colors
                    disabled:opacity-50
                  "
                >
                  {mode === 'build' ? (
                    <Hammer className="size-3.5" />
                  ) : (
                    <ClipboardList className="size-3.5" />
                  )}

                  <span>
                    {mode === 'build' ? 'Build' : 'Plan'}
                  </span>

                  <ChevronDown className="size-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-40"
              >
                <DropdownMenuItem
                  onClick={() => setMode('build')}
                  className="cursor-pointer gap-2"
                >
                  <Hammer className="size-4" />

                  <div className="flex flex-col">
                    <span>Build</span>
                    <span className="text-[10px] text-muted-foreground">
                      Create & modify
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setMode('plan')}
                  className="cursor-pointer gap-2"
                >
                  <ClipboardList className="size-4" />

                  <div className="flex flex-col">
                    <span>Plan</span>
                    <span className="text-[10px] text-muted-foreground">
                      Plan before building
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Send */}
          <Button
            type="button"
            size="icon"
            onClick={handleSubmitClick}
            disabled={
              disabled ||
              loading ||
              (!value.trim() && !attachedImage)
            }
            className="
              rounded-full
              size-10
              bg-foreground/10
              hover:bg-foreground
              text-foreground
              hover:text-background
              border border-foreground/20
              hover:border-foreground
              shrink-0
              transition-all duration-200
            "
            title={submitHint || 'Send'}
          >
            {loading ? (
              <Spinner className="size-4" />
            ) : (
              <ArrowUp className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}