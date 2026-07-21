'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, Settings, CreditCard, BookOpen, Users, MessageSquare, Gift, 
  Coins, Monitor, Sun, Moon, Languages, AlignLeft, LogOut
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { ReferralModal } from '@/components/dashboard/referral-modal'
import { FeedbackModal } from '@/components/dashboard/feedback-modal'

export function UserDropdown() {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const [showReferralModal, setShowReferralModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  useEffect(() => {
    setMounted(true)

    const handleOpenFeedback = () => setShowFeedbackModal(true)
    const handleOpenReferral = () => setShowReferralModal(true)

    window.addEventListener('open-feedback-modal', handleOpenFeedback)
    window.addEventListener('open-referral-modal', handleOpenReferral)

    return () => {
      window.removeEventListener('open-feedback-modal', handleOpenFeedback)
      window.removeEventListener('open-referral-modal', handleOpenReferral)
    }
  }, [])

  if (!user) return null

  const isPro = user.publicMetadata?.plan === 'pro'
  const planName = isPro ? 'Pro' : 'Free'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none">
        <div className="flex items-center gap-2">
          <Avatar className="size-6 rounded-md">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="rounded-md bg-primary/10 text-xs">{user.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.fullName || user.firstName}</span>
        </div>
        <Badge 
          variant="secondary" 
          className={`h-5 px-1.5 text-[10px] font-medium tracking-tight rounded-sm opacity-80 ${isPro ? 'bg-primary/20 text-primary hover:bg-primary/20 border-primary/20' : 'bg-muted/80 hover:bg-muted/80 border-border/50'}`}
        >
          {planName}
        </Badge>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[280px] bg-card border-border shadow-xl rounded-xl p-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" align="start" alignOffset={0} sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-3 p-2 mb-1">
          <Avatar className="size-8 rounded-md">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="rounded-md bg-primary/10 text-xs">{user.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="font-semibold text-sm truncate">{user.fullName}</span>
            <span className="text-xs font-normal text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</span>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-border/60" />
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onClick={() => openUserProfile()}>
            <User className="mr-2 size-4 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onClick={() => router.push('/dashboard/settings/usage')}>
            <Settings className="mr-2 size-4 text-muted-foreground" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onClick={() => router.push('/pricing')}>
            <CreditCard className="mr-2 size-4 text-muted-foreground" />
            <span>Pricing</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onClick={() => router.push('/docs')}>
            <BookOpen className="mr-2 size-4 text-muted-foreground" />
            <span>Documentation</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onClick={() => window.open('https://discord.com/invite/x9UNvGyXzf', '_blank')}>
            <Users className="mr-2 size-4 text-muted-foreground" />
            <span>Community</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onSelect={() => setShowFeedbackModal(true)}>
            <MessageSquare className="mr-2 size-4 text-muted-foreground" />
            <span>Feedback</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer py-2 text-sm rounded-md" onSelect={() => setShowReferralModal(true)}>
            <Gift className="mr-2 size-4 text-muted-foreground" />
            <span>Refer</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/60" />

        <DropdownMenuGroup className="p-1">
          <div className="flex items-center justify-between px-2 py-2 text-sm">
            <div className="flex items-center">
              <Coins className="mr-2 size-4 text-muted-foreground" />
              <span>Credits</span>
            </div>
            <span className="font-medium text-muted-foreground">5.00</span>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/60" />
        
        <DropdownMenuLabel className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-1 px-2 pt-2">
          Preferences
        </DropdownMenuLabel>
        
        <DropdownMenuGroup className="p-1">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="py-2 text-sm rounded-md">
              {mounted && theme === 'dark' ? (
                <Moon className="mr-2 size-4 text-muted-foreground" />
              ) : (
                <Sun className="mr-2 size-4 text-muted-foreground" />
              )}
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('light')}>Light</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="py-2 text-sm rounded-md">
              <Languages className="mr-2 size-4 text-muted-foreground" />
              <span>Language</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem className="cursor-pointer" onClick={() => toast.success('Language is English')}>English</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border/60" />

        <div className="p-1">
          <DropdownMenuItem onSelect={() => setShowSignOutDialog(true)} className="cursor-pointer py-2 text-sm text-red-500 rounded-md">
            <LogOut className="mr-2 size-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
      <AlertDialogContent className="bg-card border-border shadow-xl rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
          <AlertDialogDescription>
            You will be redirected to the landing page and will need to sign back in to access your projects.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md border-border">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut} className="rounded-md bg-red-500 text-white hover:bg-red-600 border-none">
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    
    <ReferralModal open={showReferralModal} onOpenChange={setShowReferralModal} />
    <FeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} />
  </>
  )
}
