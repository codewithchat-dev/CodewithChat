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
      { label: 'Features', href: '/features' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Templates', href: '/templates' },
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
      { label: 'Enterprise', href: '/enterprise' },
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
    <>
      {/* Bottom CTA Section */}
      <section className="relative px-6 py-20 lg:py-28 bg-background">
        <div className="mx-auto w-full max-w-5xl rounded-2xl bg-card/90 border border-border/60 p-10 md:p-16 text-center relative overflow-hidden shadow-xl transition-all duration-700 hover:border-primary/40 group hover:shadow-primary/10">
          {/* Animated Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-50 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
          
          <div className="relative z-10 flex flex-col items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl text-foreground">
              Ready to build your first real SaaS?
            </h2>
            <p className="text-pretty text-lg md:text-xl leading-relaxed text-foreground/80 max-w-2xl">
              Start with your idea and let the AI mentor guide you step-by-step from an empty folder to a successful launch.
            </p>
            
            <Button asChild size="lg" className="mt-6 rounded-xl h-14 px-10 text-base lg:text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-1 hover:scale-105">
              <Link href="/dashboard/project-builder">
                Start Building Now
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Actual Footer */}
      <footer className="relative overflow-hidden bg-background">
        <AsciiBackground />
        
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div className="max-w-xs">
              <SiteLogo />
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                An AI software engineering mentor that helps beginners build real,
                production-grade SaaS applications.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:gap-10 lg:gap-12">
              {footerNav.map((col) => (
                <div key={col.title}>
                  <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-foreground/80 transition-colors hover:text-foreground hover:text-primary"
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
          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/50 pt-6 text-sm text-foreground/80 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} CodeWithChat. All rights reserved.</p>
            <p>Built for developers, by developers.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
