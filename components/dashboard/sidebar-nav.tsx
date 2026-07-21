'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navItems } from '@/components/dashboard/nav-items'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {navItems.map((item) => {
        const active =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
