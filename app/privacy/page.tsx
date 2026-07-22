import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import { 
  Shield, 
  Eye, 
  Lock, 
  UserCheck, 
  FileText, 
  Trash2,
  Mail,
  Scale
} from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy | CodewithChat',
  description: 'Understand how CodewithChat collects, processes, and protects your personal and technical data.',
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/50">
          <AnimatedBackground />
          
          {/* Ambient blur lights */}
          <div className="absolute left-1/3 top-1/4 -z-10 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute right-1/3 bottom-10 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-500 dark:text-violet-400 text-xs font-medium w-fit mb-6 animate-pulse">
              <Shield className="size-3.5" />
              <span>Your Privacy is Guaranteed</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              At CodewithChat, transparent data practices are the foundation of our engineering. 
              Learn how we collect, secure, and handle your information.
            </p>

            {/* Privacy Feature Grid */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                  <UserCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Full Data Control</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Request access, export, or permanently delete your account history and settings anytime.</p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <Eye className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Zero Selling</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">We do not sell, rent, or trade your personal information or codebase files to third parties.</p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 mb-4">
                  <Lock className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Secure Credentials</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">All authentication and billing data are protected by industry leaders (Clerk and Stripe).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Sections with Sticky TOC */}
        <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[240px_1fr]">
            
            {/* Sidebar Navigation */}
            <aside className="md:sticky md:top-28 h-fit self-start hidden md:block">
              <div className="space-y-1 border-l border-border/60 pl-4 py-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-4">On this page</p>
                {[
                  { id: 'introduction', label: '1. Introduction' },
                  { id: 'data-collection', label: '2. Information We Collect' },
                  { id: 'data-usage', label: '3. How We Use Data' },
                  { id: 'data-sharing', label: '4. Third-Party Sharing' },
                  { id: 'data-retention', label: '5. Data Retention' },
                  { id: 'cookies', label: '6. Cookies & Tracking' },
                  { id: 'user-rights', label: '7. Your Privacy Rights' },
                  { id: 'contact', label: '8. Contact Us' }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    id={`toc-link-${item.id}`}
                    className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>

            {/* Document Content */}
            <div className="space-y-16 max-w-none text-muted-foreground">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <FileText className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">1. Introduction</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    Your privacy is critically important to us. It is CodewithChat's policy to respect your privacy regarding any information we may collect from you across our website and desktop integration points.
                  </p>
                  <p>
                    We only request personal information when it is genuinely necessary to deliver a high-quality service. We collect it by fair and lawful means, with your clear knowledge and consent. This document clarifies what we collect, how it is managed, and how we protect your personal and development telemetry.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Information Collection */}
              <section id="data-collection" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Eye className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">2. Information We Collect</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We collect different types of data depending on how you interact with our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Account Information:</strong> When you register on CodewithChat, we collect account credentials (such as your name, email address, and profile picture) handled securely via our authentication partner, Clerk.</li>
                    <li><strong className="text-foreground">Development Context:</strong> To run chat sessions and guide you, we process code snippets, files, prompts, and config details that you submit.</li>
                    <li><strong className="text-foreground">Payment Details:</strong> Subscriptions and billing information are collected directly and securely processed by Stripe. We do not store credit card numbers on our servers.</li>
                    <li><strong className="text-foreground">Technical Log Data:</strong> We automatically log details about your browser, operating system, IP address, and platform usage to troubleshoot issues and optimize performance.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* How We Use Data */}
              <section id="data-usage" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Lock className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">3. How We Use Your Data</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We utilize your data strictly to maintain, improve, and secure the CodewithChat experience:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>Providing code recommendations, project structure guidelines, and chat assistance.</li>
                    <li>Authenticating your account and managing subscription access.</li>
                    <li>Analyzing usage metrics to identify bug hotspots and refine user flows.</li>
                    <li>Blocking malicious software generation, spam abuse, or security breaches.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Data Sharing */}
              <section id="data-sharing" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Scale className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">4. Third-Party Sharing</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We never sell, rent, or trade your personal information. We only share data with verified subprocessors strictly required to operate our service:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Clerk:</strong> For identity verification and sign-in management.</li>
                    <li><strong className="text-foreground">Supabase:</strong> As our primary secure cloud database provider.</li>
                    <li><strong className="text-foreground">Google Vertex AI / Gemini API:</strong> To process prompt queries and generate responsive codebase setups.</li>
                    <li><strong className="text-foreground">Stripe:</strong> For secure invoice generation and payment clearance.</li>
                  </ul>
                  <p>
                    All third-party services are contractually bound under strict Data Processing Agreements (DPAs) that prohibit them from using your data for any other purposes.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Data Retention */}
              <section id="data-retention" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Trash2 className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">5. Data Retention & Deletion</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We retain personal data only for as long as necessary to provide your requested services. When data is no longer required, we perform secure, irreversible deletions.
                  </p>
                  <p>
                    At any time, you can request full deletion of your profile, projects, and chat logs by contacting our support team or using the dashboard settings. Account deletion is fully completed across all database tables and integrations within 30 days of the request.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Cookies */}
              <section id="cookies" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Shield className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">6. Cookies & Tracking</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We use cookies and equivalent local storage items strictly to preserve your sign-in session and store UI preferences (like Dark/Light mode status). 
                  </p>
                  <p>
                    We do not deploy invasive cross-site advertising trackers. You can disable cookies in your browser settings, though doing so will prevent you from signing in or maintaining active workspace sessions.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* User Rights */}
              <section id="user-rights" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <UserCheck className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">7. Your Privacy Rights (GDPR & CCPA)</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    Regardless of your geographic location, we respect your rights regarding personal data processing:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Right of Access:</strong> You can request a breakdown of what personal data we have stored.</li>
                    <li><strong className="text-foreground">Right of Correction:</strong> You can update inaccurate profile configurations.</li>
                    <li><strong className="text-foreground">Right of Erasure:</strong> You can command permanent deletion of your data.</li>
                    <li><strong className="text-foreground">Right to Portability:</strong> You can request your historical project details in a standard machine-readable format.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Contact Us */}
              <section id="contact" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Mail className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">8. Contact Us</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    If you have questions about how we handle user data, secure our APIs, or if you would like to request data deletion, please contact us:
                  </p>
                  <p className="flex items-center gap-2 text-foreground font-semibold">
                    <Mail className="size-4 text-primary" />
                    <span>privacy@codewithchat.com</span>
                  </p>
                  <p className="text-sm text-muted-foreground/80 mt-6">
                    Last modified: July 22, 2026
                  </p>
                </div>
              </section>

            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  )
}

