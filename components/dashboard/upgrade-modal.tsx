'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Zap } from 'lucide-react'

export function UpgradeModal({ children }: { children?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? children : (
          <button className="mt-4 flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Upgrade to Pro - $10/mo
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="size-5 text-yellow-500 fill-yellow-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Unlock the full potential of CodewithChat AI Studio with our Pro plan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Pro Plan</h3>
              <div className="text-right">
                <span className="text-3xl font-bold">$10</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span className="font-medium">500 Monthly Credits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span>Unlimited Projects</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span>Priority AI response speed</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span>Private repositories</span>
              </li>
            </ul>
          </div>
          
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Need more credits?</h3>
                <p className="text-xs text-muted-foreground mt-1">One-time top-up for active projects</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold">$5</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-primary" />
                <span className="font-medium">100 Extra Credits</span>
              </div>
              <Button variant="outline" size="sm">
                Buy Credits
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
          <Button className="w-full">
            Proceed to Checkout
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secure payment powered by Stripe. You can cancel anytime.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
