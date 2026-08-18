'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/site-logo'
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
    <header className="sticky top-6 z-50 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex h-16 items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl px-6 shadow-lg shadow-black/10">
        <Link href={userId ? "/dashboard" : "/"} aria-label="CodewithChat home">
          <SiteLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/90 transition-colors hover:text-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground hover:text-primary outline-none">
              Resources <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
              {resourcesLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!userId ? (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button variant="outline" size="sm" className="font-medium">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <Button size="sm" className="font-medium shadow-lg shadow-primary/20">Sign Up</Button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Button asChild size="sm" className="font-medium shadow-lg shadow-primary/20">
                <Link href="/dashboard">Open Studio</Link>
              </Button>
              <UserButton />
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
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
        <div className="absolute top-full left-4 right-4 mt-3 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl md:hidden overflow-hidden">
          <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-surface-hover hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2 text-sm font-semibold text-foreground">Resources</div>
            {resourcesLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg pl-6 pr-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-surface-hover hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/50 pt-4">
              {!userId ? (
                <>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button variant="outline" size="sm" className="w-full font-medium">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button size="sm" className="w-full font-medium shadow-lg shadow-primary/20">Sign Up</Button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <Button asChild size="sm" className="w-full font-medium shadow-lg shadow-primary/20">
                    <Link href="/dashboard">Open Studio</Link>
                  </Button>
                  <div className="mt-3 flex justify-center">
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
