import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="text-4xl font-bold tracking-tight mb-8">About Us</h1>
          <div className="prose prose-neutral dark:prose-invert">
            <p className="text-lg text-muted-foreground mb-6">
              Building software shouldn't be a bottleneck for great ideas. At CodewithChat, we are revolutionizing how applications are built by bridging the gap between natural language and production-ready code.
            </p>
            <h2 className="text-2xl font-semibold mt-10 mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              We empower founders and developers to build modern, scalable web applications simply by describing them. By utilizing the modern web's best stack (Next.js, TypeScript, and Supabase), we ensure that your MVPs aren't just prototypes—they are ready for millions of users.
            </p>
            <h2 className="text-2xl font-semibold mt-10 mb-4">Built for the Future</h2>
            <p className="text-muted-foreground mb-6">
              From our interactive Web IDE to our System Design Mentor, we provide a complete suite of tools to help you go from zero to production without the boilerplate hassle.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
