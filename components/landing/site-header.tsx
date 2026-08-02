'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/site-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserButton, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Enterprise', href: '/enterprise' },
  { label: 'Community', href: '/community' },
]

const resourcesLinks = [
  { label: 'Templates', href: '/templates' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { userId } = useAuth()

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-5xl px-4 sm:px-6">
      <div className="flex h-14 items-center justify-between gap-4 rounded-full border border-white/10 bg-background/40 px-6 backdrop-blur-xl shadow-lg shadow-black/20">
        <Link href={userId ? "/dashboard" : "/"} aria-label="CodewithChat AI Studio home">
          <SiteLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground outline-none">
              Resources <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {resourcesLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {!userId ? (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button variant="ghost" size="sm">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <Button size="sm">Start Building</Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Button asChild size="sm">
                <Link href="/dashboard">Open Studio</Link>
              </Button>
              <UserButton />
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-4 right-4 mt-2 rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl shadow-xl md:hidden overflow-hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-2 py-2 text-sm font-medium text-foreground">Resources</div>
            {resourcesLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md pl-6 pr-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {!userId ? (
                <>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button size="sm" className="w-full">Start Building</Button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <Button asChild size="sm">
                    <Link href="/dashboard">Open Studio</Link>
                  </Button>
                  <div className="mt-2 flex justify-center">
                    <UserButton />
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
