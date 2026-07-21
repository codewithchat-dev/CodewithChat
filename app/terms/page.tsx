import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
          <div className="prose prose-neutral dark:prose-invert text-muted-foreground space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using CodewithChat, you accept and agree to be bound by the terms and provision of this agreement. 
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on CodewithChat's website for personal, non-commercial transitory viewing only.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Disclaimer</h2>
            <p>
              The materials on CodewithChat's website are provided on an 'as is' basis. CodewithChat makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
