import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Zap, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function UsageSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const dbUser = await db.user.findUnique({
    where: { clerkId: userId }
  })

  // If user doesn't exist yet, default to 5 credits
  const credits = dbUser?.credits ?? 5
  const maxCredits = 5
  const usagePercentage = ((maxCredits - credits) / maxCredits) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usage & Credits</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor your AI generation limits and credit balance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="size-4 text-yellow-500 fill-yellow-500" />
              Available Credits
            </h3>
            <span className="text-2xl font-bold tracking-tight">{credits}</span>
          </div>
          
          <Progress value={usagePercentage} className="h-2 mb-3 bg-muted" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{maxCredits - credits} used</span>
            <span>{maxCredits} total limit</span>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Button asChild className="w-full">
              <Link href="/dashboard/settings/billing">Upgrade to Pro for Unlimited</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-primary/5 p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-3">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <AlertCircle className="size-6" />
          </div>
          <h3 className="font-semibold">Need more credits?</h3>
          <p className="text-sm text-muted-foreground">
            Your free credits reset every 24 hours. If you are building multiple projects, consider upgrading your plan.
          </p>
        </div>
      </div>
    </div>
  )
}
