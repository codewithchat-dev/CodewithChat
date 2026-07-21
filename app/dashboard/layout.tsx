'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { SiteLogo } from '@/components/site-logo'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { RecentProjects } from '@/components/dashboard/recent-projects'
import { CreditsCard } from '@/components/dashboard/credits-card'
import { PanelLeftClose, Menu, Search, PanelLeftOpen } from 'lucide-react'
import { UserDropdown } from '@/components/dashboard/user-dropdown'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className={`min-h-screen bg-background transition-all duration-300 ${isSidebarOpen ? 'lg:grid lg:grid-cols-[16rem_1fr]' : 'flex flex-col'}`}>
      
      {/* Mobile Floating Menu Button */}
      <div className="absolute top-4 left-4 z-40 lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur shadow-sm">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col h-full">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-16 items-center border-b border-border px-6 shrink-0">
              <SiteLogo />
            </div>
            <div className="p-4 shrink-0">
              <Button
                variant="outline"
                className="w-full justify-start text-sm text-muted-foreground font-normal bg-muted/50 hover:bg-muted pr-2"
                onClick={() => window.dispatchEvent(new Event('open-command-menu'))}
              >
                <Search className="mr-2 size-4 shrink-0" />
                <span className="truncate">Search...</span>
                <kbd className="pointer-events-none ml-auto inline-flex h-5 shrink-0 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <SidebarNav />
              <div className="my-4 h-px bg-border/50 mx-2" />
              <RecentProjects />
            </div>
            
            {/* Mobile Sidebar Footer */}
            <div className="border-t border-border p-4 shrink-0 space-y-4">
              <CreditsCard />
              <div className="flex items-center justify-between pt-2 px-1">
                <UserDropdown />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Toggle Button (Visible when sidebar is closed) */}
      {!isSidebarOpen && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-40 hidden lg:flex bg-background/80 backdrop-blur shadow-sm text-muted-foreground hover:text-foreground"
          aria-label="Open sidebar"
        >
          <PanelLeftOpen className="size-5" />
        </Button>
      )}

      {/* Desktop Sidebar */}
      {isSidebarOpen && (
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-background lg:flex animate-in slide-in-from-left duration-300">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
            <Link href="/dashboard" aria-label="CodewithChat AI Studio home">
              <SiteLogo />
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50"
            >
              <PanelLeftClose className="size-5" />
            </button>
          </div>
          
          <div className="p-4 shrink-0">
            <Button
              variant="outline"
              className="w-full justify-start text-sm text-muted-foreground font-normal bg-muted/50 hover:bg-muted pr-2"
              onClick={() => window.dispatchEvent(new Event('open-command-menu'))}
            >
              <Search className="mr-2 size-4 shrink-0" />
              <span className="truncate">Search...</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 shrink-0 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            <SidebarNav />
            <div className="my-4 h-px bg-border/50 mx-2" />
            <RecentProjects />
          </div>
          
          <div className="border-t border-border p-4 shrink-0 space-y-4">
            <CreditsCard />

            {/* Unified User Profile & Settings */}
            <div className="flex items-center justify-between px-1 pt-1">
              <UserDropdown />
            </div>
          </div>
        </aside>
      )}

      {/* Main Workspace Area (Full Screen Canvas) */}
      <main className="flex h-screen flex-col min-w-0 relative overflow-hidden">
        {children}
      </main>
    </div>
  )
}
