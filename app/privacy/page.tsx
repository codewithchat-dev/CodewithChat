import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
          <div className="prose prose-neutral dark:prose-invert text-muted-foreground space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              Your privacy is important to us. It is CodewithChat's policy to respect your privacy regarding any information we may collect from you across our website.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Information We Collect</h2>
            <p>
              We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. 
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How We Use Your Data</h2>
            <p>
              The data we collect is used strictly for authentication, providing our AI services, and improving your user experience. We do not sell your personal data to third parties.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Security</h2>
            <p>
              We use standard security protocols (like Clerk for authentication and secure database environments) to protect your data. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
