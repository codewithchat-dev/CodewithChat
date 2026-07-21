import {
  LayoutDashboard,
  Hammer,
  FileCode2,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Templates', href: '/dashboard/templates', icon: FileCode2 },
]
