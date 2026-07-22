'use client'

import { useState } from 'react'
import { Check, Zap, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { Switch } from '@/components/ui/switch'
import { useAuth, SignInButton, SignUpButton } from '@clerk/nextjs'

// ── Auth-gated Pricing Button ─────────────────────────────────────────────────
// requireAuth=false → always opens Clerk sign-up modal (Free plan — always accessible)
// requireAuth=true  → if not signed in, opens Clerk sign-in popup; if signed in, goes to billing
function PricingButton({
  label,
  requireAuth,
  variant = 'default',
  size = 'lg',
}: {
  label: string
  requireAuth: boolean
  variant?: 'default' | 'outline'
  size?: 'sm' | 'lg'
}) {
  const { isSignedIn } = useAuth()

  // Free plan — always open sign-up
  if (!requireAuth) {
    return (
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant={variant} className="mt-8 w-full" size={size}>
          {label}
        </Button>
      </SignUpButton>
    )
  }

  // Paid plan — not logged in → show sign-in popup
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal" forceRedirectUrl="/dashboard/settings/billing">
        <Button variant={variant} className="mt-8 w-full" size={size}>
          {label}
        </Button>
      </SignInButton>
    )
  }

  // Paid plan — logged in → go to billing
  return (
    <Button
      variant={variant}
      className="mt-8 w-full"
      size={size}
      onClick={() => { window.location.href = '/dashboard/settings/billing' }}
    >
      {label}
    </Button>
  )
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <SiteHeader />
      
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Simple, predictable pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Start building for free. Upgrade when you need more power, priority access, and unlimited credits.
          </p>
          
          <div className="flex items-center gap-3 mt-8">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly <span className="ml-1 rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {/* Free Tier — no auth required */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Free</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                $0
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Perfect for trying out the platform and building small projects.
              </p>
            </div>
            <ul className="mt-2 space-y-4 flex-1">
              <li className="flex items-start gap-3">
                <Check className="size-5 text-primary shrink-0" />
                <span className="text-sm font-medium">5 Free Daily Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Resets every 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Public Projects only</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Community support</span>
              </li>
            </ul>
            <PricingButton variant="outline" label="Get Started for Free" requireAuth={false} />
          </div>

          {/* Pro Tier — requires login */}
          <div className="flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-xl relative md:scale-105 z-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1">
                <Zap className="size-3 fill-current" />
                Most Popular
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Pro</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                ${isYearly ? '8' : '10'}
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {isYearly ? 'Billed $96 annually. ' : ''}For developers shipping production-ready applications.
              </p>
            </div>
            <ul className="mt-2 space-y-4 flex-1">
              <li className="flex items-start gap-3">
                <Check className="size-5 text-primary shrink-0" />
                <span className="text-sm font-medium">500 Monthly Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Unlimited Projects</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Priority AI response speed</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-primary shrink-0" />
                <span className="text-sm font-medium">Private repositories</span>
              </li>
            </ul>
            <PricingButton variant="default" label="Upgrade to Pro" requireAuth={true} />
          </div>

          {/* Student Tier — requires login */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="mb-6">
              <h3 className="text-2xl font-bold">Student Pack</h3>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                ${isYearly ? '4' : '5'}
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                50% off Pro for verified GitHub Student Developer Pack users.
              </p>
            </div>
            <ul className="mt-2 space-y-4 flex-1">
              <li className="flex items-start gap-3">
                <Github className="size-5 text-foreground shrink-0" />
                <span className="text-sm font-medium">GitHub Verification Required</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Same benefits as Pro</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Valid for 1 year</span>
              </li>
            </ul>
            <PricingButton variant="outline" label="Verify with GitHub" requireAuth={true} />
          </div>
        </div>

        {/* Credit Packs — requires login */}
        <div className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Pay-as-you-go Credits</h2>
            <p className="text-muted-foreground">
              Run out of monthly credits? Top up instantly without changing your subscription tier.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border bg-muted/30">
              <div className="font-semibold text-sm text-muted-foreground">Credit Pack</div>
              <div className="font-semibold text-sm text-muted-foreground">Price</div>
              <div className="font-semibold text-sm text-muted-foreground text-right">Action</div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border items-center">
              <div className="font-medium text-sm md:text-base">100 Extra Credits</div>
              <div className="text-sm md:text-base">$5.00</div>
              <div className="text-right">
                <PricingButton variant="outline" size="sm" label="Buy Pack" requireAuth={true} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-border items-center">
              <div className="font-medium flex flex-col md:flex-row md:items-center gap-1 text-sm md:text-base">
                500 Extra Credits 
                <span className="w-fit text-[10px] md:text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">Save 10%</span>
              </div>
              <div className="text-sm md:text-base">$22.50</div>
              <div className="text-right">
                <PricingButton variant="outline" size="sm" label="Buy Pack" requireAuth={true} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 p-6 items-center">
              <div className="font-medium flex flex-col md:flex-row md:items-center gap-1 text-sm md:text-base">
                1000 Extra Credits 
                <span className="w-fit text-[10px] md:text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
              </div>
              <div className="text-sm md:text-base">$40.00</div>
              <div className="text-right">
                <PricingButton variant="outline" size="sm" label="Buy Pack" requireAuth={true} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
