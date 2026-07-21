import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/site-logo'

const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Project Builder', href: '/dashboard/project-builder' },
      { label: 'System Design Mentor', href: '/dashboard/system-design' },
      { label: 'Build Steps', href: '/dashboard/build-steps' },
      { label: 'Tools Library', href: '/dashboard/tools' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Documentation', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Support', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer>
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
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              An AI software engineering mentor that helps beginners build real,
              production-grade SaaS applications.
            </p>
          </div>
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
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CodewithChat AI Studio. All rights reserved.</p>
          <p>Built for developers, by developers.</p>
        </div>
      </div>
    </footer>
  )
}
