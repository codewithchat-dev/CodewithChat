import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import { EnterpriseForm } from '@/components/landing/enterprise-form'
import { 
  ShieldAlert, 
  Cpu, 
  Settings, 
  Award,
  Clock, 
  CloudLightning,
  ChevronRight,
  Database,
  Users
} from 'lucide-react'

export const metadata = {
  title: 'CodewithChat for Enterprise | Secure AI Coding Studio',
  description: 'Deploy CodewithChat securely in your VPC, fine-tune models on your private repositories, and scale software development with enterprise guardrails.',
}

export default function EnterprisePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-24 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/50">
          <AnimatedBackground />

          {/* Ambient Glows */}
          <div className="absolute left-10 top-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
          <div className="absolute right-10 bottom-10 -z-10 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

          <div className="mx-auto max-w-6xl px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Hero Details */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-500 dark:text-violet-400 text-xs font-semibold w-fit animate-pulse">
                  <Award className="size-3.5" />
                  <span>Enterprise Edition</span>
                </div>
                
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-none">
                  AI Software Engineering, Securely Scaled.
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Bring CodewithChat inside your company boundaries. Train custom AI engines on your private code bases and host the builder safely inside your secure VPC.
                </p>

                <div className="flex flex-wrap gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <ShieldAlert className="size-4 text-emerald-500" />
                    <span>VPC & Self-Hosted options</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Cpu className="size-4 text-primary" />
                    <span>Proprietary LLM training</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Clock className="size-4 text-violet-500" />
                    <span>Guaranteed SLA support</span>
                  </div>
                </div>
              </div>

              {/* Interactive Demo Form */}
              <div className="lg:col-span-5 w-full">
                <EnterpriseForm />
              </div>

            </div>
          </div>
        </section>

        {/* Value Pillars Section */}
        <section className="py-20 lg:py-28 bg-muted/20 relative">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Engineered for Enterprise Compliance
              </h2>
              <p className="text-muted-foreground text-base">
                While standard AI tools expose codebases to public API telemetry, CodewithChat Enterprise sets strict security parameters to protect corporate IP.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1 */}
              <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Database className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">VPC & On-Prem Hosting</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Run the code sandbox engine, database sync hooks, and AI orchestrators directly within your AWS, GCP, Azure, or on-premise Kubernetes environments.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 mb-6">
                  <Cpu className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Custom Code Tuning</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Fine-tune secure models using your private repositories, design system components, styling templates, and custom API SDK definitions.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                  <Users className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Admin Governance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Utilize SAML/SSO authentication, assign Role-Based Access Controls (RBAC), view audit histories, and set spending limits on team tokens.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Detailed Enterprise Operations */}
        <section className="py-20 lg:py-28 mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Image / Visuals */}
            <div className="p-8 rounded-3xl border border-border/80 bg-card/40 backdrop-blur-md relative overflow-hidden aspect-video flex flex-col justify-center gap-4">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
              
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operational Status</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-foreground">Zero-Trust Local Execution</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Workspace codes compile in temporary, local client-side memory blocks. Absolute control over what telemetry is transmitted to backend endpoints.
                </p>
              </div>

              <div className="mt-4 p-4 border border-border rounded-xl bg-background/50 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Active Models</span>
                  <span className="font-semibold text-foreground">Google Gemini 1.5 Pro (Private VPC)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Encryption Standard</span>
                  <span className="font-semibold text-foreground">AES-256 / TLS 1.3</span>
                </div>
              </div>
            </div>

            {/* Right Details */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Built to Support Enterprise SLA Requirements
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                When deploying CodewithChat at scale, we guarantee absolute support. Our technical and business pipelines offer:
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <ChevronRight className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">99.9% Uptime Guarantee</h4>
                    <p className="text-sm text-muted-foreground mt-1">Legally binding SLA guarantees on orchestrator uptime and local workspace compiler sync tools.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <ChevronRight className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">Dedicated Solutions Engineer</h4>
                    <p className="text-sm text-muted-foreground mt-1">A named point of contact to assist with pipeline setups, local VPC deployments, and custom LLM tuning.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                    <ChevronRight className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">Continuous Security Audits</h4>
                    <p className="text-sm text-muted-foreground mt-1">Periodic external penetration tests, code scanning vulnerability charts, and SOC 2 Type II assurance documentation.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
