import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Crown, Shield } from 'lucide-react'

export default function TeamSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Invite colleagues and manage their permissions.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 shrink-0">
          Pro Feature
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
              <Users className="size-5" />
            </div>
            <div className="flex-1 w-full relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="colleague@company.com" className="pl-9 bg-background w-full" disabled />
            </div>
          </div>
          <Button disabled className="w-full sm:w-auto shrink-0">Send Invite</Button>
        </div>

        <div className="p-0">
          <div className="flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">ME</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  You
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-muted">Owner</Badge>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Admin access</p>
              </div>
            </div>
            <div className="text-muted-foreground">
              <Crown className="size-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="size-5 text-primary" />
          <h3 className="font-semibold">Security & Access Control</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Upgrade to the Pro plan to enforce Two-Factor Authentication (2FA) for all team members, set up SAML SSO, and define custom role-based access control policies.
        </p>
        <Button variant="outline">Learn more about Enterprise Security</Button>
      </div>
    </div>
  )
}
