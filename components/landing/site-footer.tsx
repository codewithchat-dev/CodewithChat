import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/site-logo'
import { AsciiBackground } from './ascii-background'

const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'AI Policy', href: '/ai-policy' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Twitter / X', href: 'https://x.com/codewithchat' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/codewithchat' },
      { label: 'YouTube', href: 'https://www.youtube.com/@codewithchat' },
      { label: 'Discord', href: 'https://discord.com/invite/x9UNvGyXzf' },
      { label: 'Instagram', href: 'https://www.instagram.com/codewithchat/#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-background">
      <AsciiBackground />
      <div className="relative z-10">
        <section className="border-b border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
          <div className="max-w-xl">
            <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to build your first real SaaS?
            </h2>
            <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
              Start with your idea and let the mentor guide you to launch.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/dashboard/project-builder">
              Start Building
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <SiteLogo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              An AI software engineering mentor that helps beginners build real,
              production-grade SaaS applications.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-10 lg:gap-12">
            {footerNav.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-medium">{col.title}</h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CodewithChat AI Studio. All rights reserved.</p>
          <p>Built for developers, by developers.</p>
        </div>
      </div>
      </div>
    </footer>
  )
}
