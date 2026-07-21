'use client'

import { useState } from 'react'
import { Check, Zap, Github, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

export default function BillingSettingsPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="space-y-12 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your subscription and upgrade to get unlimited credits.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8">
          <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly <span className="ml-1 rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs font-bold">Save 20%</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Free Tier (Current) */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Free</h3>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">Current Plan</Badge>
              </div>
              <div className="mt-4 flex items-baseline text-4xl font-bold">
                $0
                <span className="ml-1 text-lg font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Perfect for trying out the platform and building small projects.
              </p>
            </div>
            <ul className="mt-2 space-y-3 flex-1">
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">5 Free Daily Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Resets every 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Public Projects only</span>
              </li>
            </ul>
          </div>

          {/* Student Dev Pack Tier */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-bold">Student Dev Pack</h3>
              <div className="mt-4 flex items-baseline text-4xl font-bold">
                ${isYearly ? '4' : '5'}
                <span className="ml-1 text-lg font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {isYearly ? 'Billed $48 annually. ' : ''}Special pricing for students building portfolios.
              </p>
            </div>
            <ul className="mt-2 space-y-3 flex-1">
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">150 Monthly Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Up to 3 Private Projects</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Discord Community Role</span>
              </li>
            </ul>
            <Button variant="outline" className="mt-8 w-full gap-2">
              <CreditCard className="size-4" />
              Upgrade
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="flex flex-col rounded-2xl border-2 border-primary bg-card p-6 shadow-xl relative">
            <div className="absolute top-0 right-6 -translate-y-1/2">
              <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full flex items-center gap-1">
                <Zap className="size-3 fill-current" />
                Recommended
              </span>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Pro</h3>
              <div className="mt-4 flex items-baseline text-4xl font-bold">
                ${isYearly ? '8' : '10'}
                <span className="ml-1 text-lg font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {isYearly ? 'Billed $96 annually. ' : ''}For developers shipping production-ready applications.
              </p>
            </div>
            <ul className="mt-2 space-y-3 flex-1">
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">500 Monthly Credits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Unlimited Projects</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="size-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium">Private repositories</span>
              </li>
            </ul>
            <Button className="mt-8 w-full gap-2">
              <CreditCard className="size-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm mt-8">
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-muted/30">
          <div className="font-semibold text-sm text-muted-foreground">Credit Pack (Top Up)</div>
          <div className="font-semibold text-sm text-muted-foreground">Price</div>
          <div className="font-semibold text-sm text-muted-foreground text-right">Action</div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-border items-center">
          <div className="font-medium text-sm">100 Extra Credits</div>
          <div className="text-sm">$5.00</div>
          <div className="text-right"><Button variant="outline" size="sm">Buy</Button></div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 border-b border-border items-center">
          <div className="font-medium flex flex-col xl:flex-row xl:items-center gap-1 text-sm">
            500 Credits 
            <span className="w-fit text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">Save 10%</span>
          </div>
          <div className="text-sm">$22.50</div>
          <div className="text-right"><Button variant="outline" size="sm">Buy</Button></div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4 items-center">
          <div className="font-medium flex flex-col xl:flex-row xl:items-center gap-1 text-sm">
            1000 Credits 
            <span className="w-fit text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
          </div>
          <div className="text-sm">$40.00</div>
          <div className="text-right"><Button variant="outline" size="sm">Buy</Button></div>
        </div>
      </div>
    </div>
  )
}
