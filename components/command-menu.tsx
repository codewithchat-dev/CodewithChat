'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useClerk } from '@clerk/nextjs'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Plus,
  FolderPlus,
  CreditCard,
  Home,
  Hammer,
  LayoutTemplate,
  BookOpen,
  Settings,
  Activity,
  Users,
  Bell,
  Sun,
  Moon,
  Laptop,
  Monitor,
  Wrench,
  User,
  MessageSquare,
  Gift
} from 'lucide-react'

export function CommandMenu() {
  const router = useRouter()
  const { openUserProfile } = useClerk()
  const [open, setOpen] = React.useState(false)
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Listen for custom event from fake search bars
  React.useEffect(() => {
    const handleOpenCommand = () => setOpen(true)
    window.addEventListener('open-command-menu', handleOpenCommand)
    return () => window.removeEventListener('open-command-menu', handleOpenCommand)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/project-builder'))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Project</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => openUserProfile())}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings/billing'))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Buy More Credits</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.open('https://discord.com/invite/x9UNvGyXzf', '_blank'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Join Community</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.dispatchEvent(new Event('open-feedback-modal')))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Submit Feedback</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.dispatchEvent(new Event('open-referral-modal')))}>
            <Gift className="mr-2 h-4 w-4" />
            <span>Refer a Friend</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/project-builder'))}>
            <Hammer className="mr-2 h-4 w-4" />
            <span>Project Builder</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/templates'))}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            <span>Templates</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/system-design'))}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>System Design</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/tools'))}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Tools Library</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/docs'))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings/usage'))}>
            <Activity className="mr-2 h-4 w-4" />
            <span>Usage & Credits</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings/billing'))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing & Plan</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings/team'))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings/notifications'))}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Theme</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System Theme</span>
          </CommandItem>
        </CommandGroup>

      </CommandList>
    </CommandDialog>
  )
}
