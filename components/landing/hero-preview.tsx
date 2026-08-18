'use client'

import { useEffect, useState } from 'react'
import { Terminal, Code2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const COMMANDS = [
  { cmd: 'npm create codewithchat-app my-portfolio', delay: 500 },
  { cmd: 'cd my-portfolio && npm install', delay: 1000 },
  { cmd: 'npx cwc add auth billing dashboard', delay: 800 },
  { cmd: 'npm run dev', delay: 800 },
  {
    cmd: 'Ready on https://codewithchat.dev',
    delay: 1000,
    isSuccess: true,
  },
]

export function HeroPreview() {
  const [currentCommand, setCurrentCommand] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (currentCommand >= COMMANDS.length) {
      timeout = setTimeout(() => {
        setCurrentCommand(0)
        setTypedText('')
        setIsTyping(false)
      }, 3000)

      return () => clearTimeout(timeout)
    }

    const command = COMMANDS[currentCommand]

    if (command.isSuccess) {
      setTypedText(command.cmd)

      timeout = setTimeout(() => {
        setCurrentCommand((prev) => prev + 1)
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
      }, 40)
    } else {
      timeout = setTimeout(() => {
        setIsTyping(false)
        setCurrentCommand((prev) => prev + 1)
      }, command.delay)
    }

    return () => clearTimeout(timeout)
  }, [currentCommand, typedText, isTyping])

  return (
    <div className="relative mx-auto mt-20 w-full max-w-5xl">

      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] md:h-[500px] md:w-[500px] md:blur-[120px]" />

      <div className="absolute top-1/2 left-1/2 -z-10 h-[200px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[80px]" />

      {/* Main Preview */}
      <div className="relative grid items-center gap-8 md:grid-cols-5">

        {/* ================= TERMINAL ================= */}
        <div className="relative z-20 overflow-hidden rounded-xl border border-border/60 bg-background/80 shadow-2xl shadow-primary/5 backdrop-blur-xl ring-1 ring-white/10 md:col-span-2 md:translate-x-8 md:translate-y-12">

          {/* Terminal Header */}
          <div className="flex items-center border-b border-border/50 bg-muted/30 px-4 py-3">

            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>

            <div className="mx-auto flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Terminal className="size-3.5" />
              <span>bash</span>
            </div>

          </div>

          {/* Terminal Body */}
          <div className="min-h-[220px] p-4 font-mono text-xs sm:text-sm">

            {COMMANDS.slice(0, currentCommand).map((cmd, i) => (
              <div
                key={i}
                className={cn(
                  'mb-2 flex items-start gap-2',
                  cmd.isSuccess
                    ? 'text-green-400'
                    : 'text-muted-foreground'
                )}
              >
                {!cmd.isSuccess && (
                  <span className="mt-0.5 text-primary">❯</span>
                )}

                {cmd.isSuccess && (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                )}

                <span className="break-all">{cmd.cmd}</span>
              </div>
            ))}

            {/* Currently typing command */}
            {currentCommand < COMMANDS.length && (
              <div className="flex items-start gap-2 text-foreground">

                {!COMMANDS[currentCommand].isSuccess && (
                  <span className="mt-0.5 text-primary">❯</span>
                )}

                {COMMANDS[currentCommand].isSuccess && (
                  <CheckCircle2 className="mt-0.5 size-4 text-green-400" />
                )}

                <span className="relative break-all">
                  {typedText}

                  {!COMMANDS[currentCommand].isSuccess && (
                    <span className="absolute -right-2 top-0.5 h-4 w-2 animate-pulse bg-primary" />
                  )}
                </span>

              </div>
            )}

          </div>
        </div>

        {/* ================= BROWSER ================= */}
        <div className="relative z-10 overflow-hidden rounded-xl border border-border/60 bg-background/50 shadow-2xl backdrop-blur-md ring-1 ring-white/10 md:col-span-3">

          {/* Browser Header */}
          <div className="flex items-center gap-4 border-b border-border/50 bg-muted/50 px-4 py-3">

            {/* Browser Dots */}
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
              <div className="h-3 w-3 rounded-full bg-border" />
            </div>

            {/* Address Bar */}
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border/50 bg-background/80 px-3 py-1.5">

              <Code2 className="size-3.5 shrink-0 text-muted-foreground" />

              <div className="truncate text-xs text-muted-foreground">
                https://codewithchat.dev/dashboard
              </div>

            </div>

          </div>

  {/* ================= LIVE BUILD PREVIEW ================= */}
<div className="relative aspect-[16/10] w-full overflow-hidden bg-background">

  {/* Glow */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,hsl(var(--primary)/0.08),transparent_60%)]" />

  <div className="relative h-full p-2.5 sm:p-3 md:p-4">

    {/* Browser */}
    <div className="h-full overflow-hidden rounded-lg border border-border/60 bg-background shadow-2xl sm:rounded-xl">

      {/* Browser Header */}
      <div className="flex h-8 items-center gap-2 border-b border-border/50 bg-muted/40 px-2.5 sm:h-9 sm:gap-3 sm:px-3">

        <div className="flex shrink-0 gap-1 sm:gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-400/70 sm:h-2.5 sm:w-2.5" />
          <div className="h-2 w-2 rounded-full bg-yellow-400/70 sm:h-2.5 sm:w-2.5" />
          <div className="h-2 w-2 rounded-full bg-green-400/70 sm:h-2.5 sm:w-2.5" />
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <div className="w-[72%] truncate rounded-md border border-border/40 bg-background/70 px-2 py-1 text-center font-mono text-[6px] text-muted-foreground sm:px-3 sm:text-[8px]">
            {currentCommand >= 4
              ? 'https://codewithchat.dev'
              : 'localhost:3000'}
          </div>
        </div>

      </div>

      {/* ================= COMMAND 1 ================= */}
      {currentCommand === 0 && (
        <div className="flex h-[calc(100%-32px)] items-center justify-center overflow-hidden p-3 sm:h-[calc(100%-36px)] sm:p-4">

          <div className="w-full max-w-[320px] animate-in fade-in zoom-in-95 duration-700">

            {/* Logo */}
            <div className="mb-2.5 flex justify-center sm:mb-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground shadow-lg shadow-primary/20 sm:h-11 sm:w-11 sm:rounded-xl sm:text-xs">
                CwC
              </div>

            </div>

            <div className="text-center">

              <div className="text-[11px] font-semibold sm:text-sm">
                Creating your project
              </div>

              <div className="mt-0.5 text-[6px] text-muted-foreground sm:mt-1 sm:text-[9px]">
                Setting up my-portfolio with CodeWithChat
              </div>

            </div>

            {/* Progress */}
            <div className="mt-3 sm:mt-4">

              <div className="mb-1.5 flex justify-between text-[6px] sm:mb-2 sm:text-[8px]">

                <span className="text-muted-foreground">
                  Initializing project
                </span>

                <span className="text-primary">
                  24%
                </span>

              </div>

              <div className="h-1 overflow-hidden rounded-full bg-muted sm:h-1.5">

                <div className="h-full w-[24%] animate-pulse rounded-full bg-primary" />

              </div>

            </div>

            {/* Files */}
            <div className="mt-3 space-y-1 sm:mt-4 sm:space-y-1.5">

              {[
                'Creating package.json',
                'Initializing Next.js',
                'Setting up Tailwind',
              ].map((item, i) => (

                <div
                  key={item}
                  className="flex animate-in fade-in slide-in-from-left-2 items-center gap-1.5 rounded-md border border-border/40 bg-muted/20 px-2 py-1.5 duration-500 sm:gap-2 sm:px-3 sm:py-2"
                  style={{
                    animationDelay: `${i * 180}ms`,
                    animationFillMode: 'both',
                  }}
                >

                  <CheckCircle2 className="size-2.5 shrink-0 text-primary sm:size-3" />

                  <span className="truncate text-[6px] text-muted-foreground sm:text-[8px]">
                    {item}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>
      )}

      {/* ================= COMMAND 2 ================= */}
      {currentCommand === 1 && (
        <div className="h-[calc(100%-32px)] overflow-hidden p-2.5 sm:h-[calc(100%-36px)] sm:p-4">

          <div className="mb-2.5 animate-in fade-in slide-in-from-top-3 duration-500 sm:mb-3">

            <div className="text-[11px] font-semibold sm:text-sm">
              Installing dependencies
            </div>

            <div className="mt-0.5 text-[6px] text-muted-foreground sm:mt-1 sm:text-[9px]">
              Preparing everything your app needs
            </div>

          </div>

          {/* Install progress */}
          <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5 sm:p-3">

            <div className="mb-1.5 flex items-center justify-between sm:mb-2">

              <span className="font-mono text-[6px] text-muted-foreground sm:text-[8px]">
                npm install
              </span>

              <span className="text-[6px] text-primary sm:text-[8px]">
                68%
              </span>

            </div>

            <div className="h-1 overflow-hidden rounded-full bg-muted sm:h-1.5">

              <div className="h-full w-[68%] animate-pulse rounded-full bg-primary" />

            </div>

          </div>

          {/* Dependencies */}
          <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2">

            {[
              ['React', 'Installed'],
              ['Next.js', 'Installed'],
              ['Tailwind', 'Installed'],
              ['Lucide', 'Installing...'],
              ['TypeScript', 'Installed'],
              ['Framer Motion', 'Installing...'],
            ].map(([name, status], i) => (

              <div
                key={name}
                className="flex min-w-0 animate-in fade-in slide-in-from-bottom-2 items-center justify-between rounded-md border border-border/50 bg-muted/10 p-1.5 duration-500 sm:rounded-lg sm:p-2"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'both',
                }}
              >

                <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">

                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 sm:h-6 sm:w-6">

                    <Code2 className="size-2.5 text-primary sm:size-3" />

                  </div>

                  <span className="truncate text-[6px] font-medium sm:text-[8px]">
                    {name}
                  </span>

                </div>

                <span
                  className={cn(
                    'ml-1 shrink-0 text-[5px] sm:text-[7px]',
                    status === 'Installed'
                      ? 'text-green-500'
                      : 'text-muted-foreground'
                  )}
                >
                  {status}
                </span>

              </div>

            ))}

          </div>

        </div>
      )}

      {/* ================= COMMAND 3 ================= */}
      {currentCommand === 2 && (
        <div className="h-[calc(100%-32px)] overflow-hidden p-2.5 sm:h-[calc(100%-36px)] sm:p-4">

          <div className="mb-2 flex items-center justify-between sm:mb-3">

            <div className="min-w-0">

              <div className="text-[10px] font-semibold sm:text-xs">
                Building your dashboard
              </div>

              <div className="mt-0.5 truncate text-[6px] text-muted-foreground sm:mt-1 sm:text-[7px]">
                Adding authentication, billing & analytics
              </div>

            </div>

            <div className="ml-2 shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[6px] text-primary sm:px-2 sm:py-1 sm:text-[7px]">
              Building...
            </div>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">

            {[
              ['Revenue', '$24,580'],
              ['Customers', '8,429'],
              ['Orders', '1,248'],
            ].map(([label, value], i) => (

              <div
                key={label}
                className="animate-in fade-in slide-in-from-bottom-3 rounded-md border border-border/50 bg-muted/20 p-1.5 duration-500 sm:rounded-lg sm:p-2"
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationFillMode: 'both',
                }}
              >

                <div className="text-[6px] text-muted-foreground sm:text-[7px]">
                  {label}
                </div>

                <div className="mt-0.5 text-[9px] font-bold sm:mt-1 sm:text-xs">
                  {value}
                </div>

                <div className="mt-0.5 text-[6px] text-green-500 sm:mt-1 sm:text-[7px]">
                  +12.5%
                </div>

              </div>

            ))}

          </div>

          {/* Revenue */}
          <div className="mt-2 rounded-lg border border-border/50 bg-muted/10 p-2 sm:mt-3 sm:p-3">

            <div className="mb-1.5 text-[7px] font-medium sm:mb-2 sm:text-[8px]">
              Revenue overview
            </div>

            <div className="flex h-[45px] items-end gap-1 sm:h-[60px]">

              {[25, 40, 32, 52, 44, 64, 58, 74, 68, 84, 76, 95].map(
                (height, i) => (

                  <div
                    key={i}
                    className="origin-bottom animate-in slide-in-from-bottom-4 flex-1 rounded-t-sm bg-primary/60 duration-500"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 60}ms`,
                      animationFillMode: 'both',
                    }}
                  />

                )
              )}

            </div>

          </div>

        </div>
      )}

      {/* ================= COMMAND 4 ================= */}
      {currentCommand >= 3 && (
        <div className="h-[calc(100%-32px)] overflow-hidden p-2.5 sm:h-[calc(100%-36px)] sm:p-3">

          {/* Header */}
          <div className="mb-2 flex items-center justify-between sm:mb-3">

            <div className="min-w-0">

              <div className="text-[10px] font-semibold sm:text-xs">
                My Portfolio
              </div>

              <div className="text-[6px] text-muted-foreground sm:text-[7px]">
                Production dashboard
              </div>

            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-1.5 py-0.5 sm:px-2 sm:py-1">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />

              <span className="text-[6px] text-green-500 sm:text-[7px]">
                Live
              </span>

            </div>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">

            {[
              ['Revenue', '$24,580'],
              ['Customers', '8,429'],
              ['Orders', '1,248'],
            ].map(([label, value]) => (

              <div
                key={label}
                className="animate-in fade-in zoom-in-95 rounded-md border border-border/50 bg-muted/20 p-1.5 duration-500 sm:rounded-lg sm:p-2"
              >

                <div className="text-[6px] text-muted-foreground sm:text-[7px]">
                  {label}
                </div>

                <div className="mt-0.5 text-[9px] font-bold sm:mt-1 sm:text-xs">
                  {value}
                </div>

                <div className="mt-0.5 text-[6px] text-green-500 sm:mt-1 sm:text-[7px]">
                  ↑ 12.5%
                </div>

              </div>

            ))}

          </div>

          {/* Bottom */}
          <div className="mt-2 grid grid-cols-5 gap-1.5 sm:mt-3 sm:gap-2">

            {/* Chart */}
            <div className="col-span-3 rounded-lg border border-border/50 bg-muted/10 p-2 sm:p-2.5">

              <div className="mb-1.5 text-[7px] font-medium sm:mb-2 sm:text-[8px]">
                Revenue overview
              </div>

              <div className="flex h-[42px] items-end gap-1 sm:h-[58px]">

                {[28, 42, 35, 52, 48, 66, 57, 76, 69, 86, 78, 96].map(
                  (height, i) => (

                    <div
                      key={i}
                      className="animate-in slide-in-from-bottom-3 flex-1 rounded-t-sm bg-primary/60 duration-500"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${i * 50}ms`,
                        animationFillMode: 'both',
                      }}
                    />

                  )
                )}

              </div>

            </div>

            {/* Activity */}
            <div className="col-span-2 rounded-lg border border-border/50 bg-muted/10 p-2 sm:p-2.5">

              <div className="mb-1.5 text-[7px] font-medium sm:mb-2 sm:text-[8px]">
                Recent activity
              </div>

              <div className="space-y-1.5 sm:space-y-2">

                {[
                  'New customer',
                  'Payment received',
                  'New order',
                ].map((item) => (

                  <div
                    key={item}
                    className="flex min-w-0 items-center gap-1.5"
                  >

                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />

                    <span className="truncate text-[6px] text-muted-foreground sm:text-[7px]">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Success */}
          <div className="mt-2 flex animate-in fade-in zoom-in items-center justify-between rounded-lg border border-green-500/20 bg-green-500/5 px-2 py-1.5 duration-700 sm:mt-3 sm:px-3 sm:py-2">

            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

              <CheckCircle2 className="size-3 shrink-0 text-green-500 sm:size-3.5" />

              <div className="min-w-0">

                <div className="text-[7px] font-semibold sm:text-[8px]">
                  Your app is live
                </div>

                <div className="truncate text-[5px] text-muted-foreground sm:text-[6px]">
                  Production deployment successful
                </div>

              </div>

            </div>

            <span className="ml-2 shrink-0 font-mono text-[5px] text-green-500 sm:text-[7px]">
              codewithchat.dev
            </span>

          </div>

        </div>
      )}

    </div>
  </div>
</div>
        </div>

      </div>
    </div>
  )
}