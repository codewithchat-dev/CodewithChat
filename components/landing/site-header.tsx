'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/site-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserButton, SignInButton, SignUpButton, useAuth } from '@clerk/nextjs'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Enterprise', href: '/enterprise' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { userId } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href={userId ? "/dashboard" : "/"} aria-label="CodewithChat AI Studio home">
          <SiteLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
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
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </a>
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
