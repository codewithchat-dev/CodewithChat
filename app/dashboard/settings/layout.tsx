'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Activity, CreditCard, Puzzle, Users, Bell } from 'lucide-react'

const SETTINGS_NAV = [
  {
    name: 'Usage & Credits',
    href: '/dashboard/settings/usage',
    icon: Activity
  },
  {
    name: 'Billing & Plan',
    href: '/dashboard/settings/billing',
    icon: CreditCard
  },
  {
    name: 'Integrations',
    href: '/dashboard/settings/integrations',
    icon: Puzzle
  },
  {
    name: 'Team',
    href: '/dashboard/settings/team',
    icon: Users
  },
  {
    name: 'Notifications',
    href: '/dashboard/settings/notifications',
    icon: Bell
  }
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col md:flex-row overflow-hidden bg-background">
      {/* Settings Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-r border-border bg-card/30 hidden md:block overflow-y-auto">
        <div className="p-6 pt-16 lg:pt-16 pb-2">
          <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your account preferences</p>
        </div>
        <nav className="p-4 space-y-1">
          {SETTINGS_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Settings Navigation */}
      <div className="md:hidden border-b border-border bg-card/30 shrink-0">
        <div className="px-4 pt-16 pb-2">
          <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
        </div>
        <nav className="flex overflow-x-auto px-4 pb-3 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {SETTINGS_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md whitespace-nowrap transition-colors shrink-0 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                    : 'text-muted-foreground border border-border/50 hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Settings Content Area */}
      <main className="flex-1 overflow-y-auto min-w-0 p-4 md:p-8">
        <div className="max-w-4xl mx-auto w-full h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
