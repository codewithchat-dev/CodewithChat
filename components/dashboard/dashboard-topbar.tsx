'use client'

import Link from 'next/link'
import { Menu, Search, PanelLeftOpen } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserButton } from '@clerk/nextjs'
import { SiteLogo } from '@/components/site-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'

export function DashboardTopbar({ 
  isSidebarOpen, 
  toggleSidebar 
}: { 
  isSidebarOpen?: boolean
  toggleSidebar?: () => void 
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center border-b border-border px-6">
            <SiteLogo />
          </div>
          <div className="p-3">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>

      <div className="relative hidden w-full max-w-sm md:flex items-center gap-2">
        {isSidebarOpen === false && toggleSidebar && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar" className="shrink-0 mr-2 text-muted-foreground hover:text-foreground">
            <PanelLeftOpen className="size-5" />
          </Button>
        )}
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search projects, tools, steps..."
          className="pl-9"
          aria-label="Search"
        />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search">
          <Search className="size-4" />
        </Button>
        <ThemeToggle />
        <div className="ml-2 flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  )
}
