import { SiteHeader } from '@/components/landing/site-header'
import { Hero } from '@/components/landing/hero'
import { Templates } from '@/components/landing/templates'
import { Features } from '@/components/landing/features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { TargetAudience } from '@/components/landing/target-audience'
import { Testimonials } from '@/components/landing/testimonials'
import { TechStackMarquee } from '@/components/landing/tech-stack-marquee'
import { SiteFooter } from '@/components/landing/site-footer'
import { AutoSignupModal } from '@/components/landing/auto-signup-modal'
import { Suspense } from 'react'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <AutoSignupModal />
      </Suspense>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <TechStackMarquee />
        <Features />
        <HowItWorks />
        <Templates />
        <TargetAudience />
        <Testimonials />
      </main>
      <SiteFooter />
    </div>
  )
}
