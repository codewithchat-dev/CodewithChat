'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getCreditsAction } from '@/app/actions/credits'
import { creditsProgress, creditsUsed, MAX_DAILY_CREDITS } from '@/lib/credits'

export function CreditsCard() {
  const pathname = usePathname()
  const [credits, setCredits] = useState(MAX_DAILY_CREDITS)
  const [maxCredits, setMaxCredits] = useState(MAX_DAILY_CREDITS)

  const refresh = () => {
    getCreditsAction().then(res => {
      if (res.success) {
        setCredits(res.credits)
        setMaxCredits(res.maxCredits)
      }
    })
  }

  useEffect(() => {
    refresh()
  }, [pathname])

  useEffect(() => {
    const onCreditsUpdated = () => refresh()
    window.addEventListener('credits-updated', onCreditsUpdated)
    return () => window.removeEventListener('credits-updated', onCreditsUpdated)
  }, [])

  const used = creditsUsed(maxCredits, credits)
  const progress = creditsProgress(maxCredits, credits)

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Credits</p>
        <Zap className="size-4 text-yellow-500 fill-yellow-500" />
      </div>
      <Progress value={progress} className="mt-3 h-2" />
      <p className="mt-2 text-xs text-muted-foreground font-medium">
        {used} / {maxCredits} daily credits used
      </p>
      <Button asChild className="w-full mt-4 text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90">
        <Link href="/pricing">Upgrade to Pro</Link>
      </Button>
    </div>
  )
}
