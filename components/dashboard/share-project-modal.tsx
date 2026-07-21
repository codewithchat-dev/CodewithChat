'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Copy, Link, Lock, Users, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

export function ShareProjectModal({ projectId }: { projectId: string }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const { user } = useUser()
  
  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/project/${projectId}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs font-medium hidden lg:flex rounded-full px-4 shrink-0">
              Share
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Share project</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md shadow-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Share project</DialogTitle>
          <DialogDescription className="text-sm">
            Invite others to view or collaborate on this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Invite Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">Invite by email</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Email address" 
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/50"
              />
              <Button 
                onClick={() => {
                  if(inviteEmail) {
                    toast.success(`Invite sent to ${inviteEmail}`)
                    setInviteEmail('')
                  }
                }}
                className="font-semibold shadow-sm hover:shadow-md transition-all"
              >
                Invite
              </Button>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Access Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">Who has project access</h4>
            
            {/* Link Status */}
            <div className="flex items-center justify-between p-3 border border-border/50 rounded-xl bg-muted/20 shadow-sm transition-all hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-full border border-border/50 shadow-sm">
                  <Lock className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Invite link disabled</span>
                  <span className="text-xs text-muted-foreground">Only invited people can access</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-2 h-8 text-xs font-medium bg-background/50 hover:bg-background">
                <Copy className="size-3" />
                Copy link
              </Button>
            </div>

            {/* User List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                    {user?.imageUrl && <AvatarImage src={user.imageUrl} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                      {user?.firstName ? user.firstName.substring(0,2).toUpperCase() : 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {user?.primaryEmailAddress?.emailAddress || 'loading...'} (you)
                    </span>
                    <span className="text-xs text-muted-foreground">General project access</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted-foreground/80 px-2 group-hover:text-foreground transition-colors">Owner</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
