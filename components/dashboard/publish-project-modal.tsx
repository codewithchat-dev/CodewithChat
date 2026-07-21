'use client'

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
import { Lock, Globe, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export function PublishProjectModal({ projectId }: { projectId: string }) {
  const handlePublish = () => {
    toast.success('Project published successfully! It is now live.')
  }

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 hidden xl:flex shrink-0">
              Publish
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">Publish project</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md shadow-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">Publish Project</DialogTitle>
          <DialogDescription className="text-sm">
            Make your application live on the internet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* URL Section */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">Your website URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center bg-muted/30 border border-border/50 rounded-md px-3 py-2.5">
                <Globe className="size-4 text-muted-foreground mr-2 shrink-0" />
                <div className="flex flex-wrap items-baseline gap-0.5 truncate">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {projectId.length > 8 ? projectId.substring(0, 8) : projectId}-project
                  </span>
                  <span className="text-sm text-muted-foreground">
                    .codewithchat.dev
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/50 w-full" />

          {/* Custom Domain Section (Locked) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                Custom Domain
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm">Pro</span>
              </h4>
              <Lock className="size-3.5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Connect your own custom domain (e.g. yourname.com) to this project.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full justify-between h-9 group border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-500/5">
              <Link href="/dashboard/settings/billing">
                <span className="text-indigo-500 font-medium">Upgrade to Pro to unlock</span>
                <ArrowRight className="size-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {/* Action Button */}
          <Button 
            className="w-full h-10 font-semibold shadow-sm hover:shadow-md transition-all"
            onClick={handlePublish}
          >
            Publish Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
