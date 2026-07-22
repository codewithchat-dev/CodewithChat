import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import { 
  ShieldCheck, 
  Code, 
  Lock, 
  HelpCircle, 
  Scale, 
  BookOpen,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

export const metadata = {
  title: 'AI Use & Safety Policy | CodewithChat',
  description: 'Understand how CodewithChat leverages artificial intelligence responsibly, including code ownership, model training details, privacy safeguards, and reliability measures.',
}

export default function AIPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 border-b border-border/40 bg-gradient-to-b from-background via-background/95 to-background/50">
          <AnimatedBackground />
          
          {/* Decorative gradients */}
          <div className="absolute left-1/4 top-1/3 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
          <div className="absolute right-1/4 bottom-10 -z-10 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-5xl px-6 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium w-fit mb-6 animate-pulse">
              <Sparkles className="size-3.5" />
              <span>Ethical & Secure AI Engineering</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              AI Use & Safety Policy
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              At CodewithChat, we leverage state-of-the-art AI systems to accelerate your development. 
              This policy defines our commitment to data transparency, code privacy, and security safeguards.
            </p>

            {/* Feature Cards */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <Code className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">100% Ownership</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">All AI-generated code is entirely yours. No royalty, no licensing restrictions, no catches.</p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 mb-4">
                  <Lock className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Zero Model Training</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">We never use your proprietary codebase, files, prompt histories, or settings to train base models.</p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 mb-4">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Direct communication with model providers uses secure SSL pipelines with strict access parameters.</p>
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
                  { id: 'code-ownership', label: '2. Code Ownership' },
                  { id: 'data-privacy', label: '3. Data Privacy' },
                  { id: 'reliability', label: '4. Accuracy & Oversight' },
                  { id: 'acceptable-use', label: '5. Acceptable Use' },
                  { id: 'security', label: '6. Security Safeguards' },
                  { id: 'updates', label: '7. Policy Updates' }
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
                  <BookOpen className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">1. Introduction</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    At CodewithChat, our mission is to empower developers of all skill levels to build production-grade, full-stack applications. To achieve this, we utilize cutting-edge generative Artificial Intelligence (AI) technologies, specifically Large Language Models (LLMs) such as Google Gemini.
                  </p>
                  <p>
                    This policy serves to define the scope, standards, and protective boundaries of our AI interactions. Our goal is to ensure that your work remains secure, compliant, and completely under your control, while giving you access to next-generation code synthesis capability.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Code Ownership */}
              <section id="code-ownership" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Code className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">2. Code Ownership & IP</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We believe in complete builder sovereignty. The intellectual property rights of all code, configuration files, and designs generated by our service belong exclusively to you.
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Full Ownership:</strong> You hold 100% of the copyrights for the applications synthesized.</li>
                    <li><strong className="text-foreground">Commercial Use:</strong> You are free to distribute, license, sell, or open-source the resulting projects under any terms of your choice.</li>
                    <li><strong className="text-foreground">No Royalties:</strong> CodewithChat does not charge licensing fees or royalties for code generated via the platform.</li>
                  </ul>
                  <div className="mt-4 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-sm text-yellow-600 dark:text-yellow-400 flex gap-3">
                    <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                    <p>
                      While we employ safety nets to prevent our AI from outputting copyrighted source code, developers are encouraged to carry out standard static analysis checks before deploying code in highly sensitive proprietary enterprise environments.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Data Privacy */}
              <section id="data-privacy" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Lock className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">3. Data Privacy & Model Training</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    Your proprietary codebase is yours alone. We maintain strict boundaries to ensure that your data is never leaked or incorporated into public AI models:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">No Base Training:</strong> We never use your custom workspace files, text prompt history, or configuration parameters to train base models.</li>
                    <li><strong className="text-foreground">Enterprise Boundaries:</strong> We route our AI calls via enterprise APIs that enforce zero data retention policies for training purposes.</li>
                    <li><strong className="text-foreground">Local Isolation:</strong> Your local code stays on your filesystem and is only referenced in context blocks temporarily to execute your queries.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Reliability */}
              <section id="reliability" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <HelpCircle className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">4. Accuracy & Human Oversight</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    Generative AI is a powerful tool to assist software development, but it is not a replacement for human judgment and code reviews.
                  </p>
                  <p>
                    Our AI models generate code based on patterns and heuristics. In some instances, it may suggest outdated libraries, deprecated features, or code sections containing logic flaws.
                  </p>
                  <p className="bg-muted/40 p-4 rounded-xl border border-border text-foreground font-medium">
                    It is the user's responsibility to review, compile, test, and verify all AI-generated code before launching it to production. We highly recommend running standard builds (<code className="text-xs bg-muted p-1 rounded font-mono">npm run build</code>) and automated unit tests.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Acceptable Use */}
              <section id="acceptable-use" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Scale className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">5. Acceptable Use Guardrails</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    To maintain a safe, clean development environment, you must adhere to ethical boundaries when leveraging CodewithChat. You are strictly prohibited from utilizing the service to build:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>Malicious payloads, exploits, ransomware, or keyloggers.</li>
                    <li>Systems designed to execute unauthorized vulnerability scans or DDOS attacks.</li>
                    <li>Spam delivery bots, phishing platforms, or deepfake/impersonation tools.</li>
                    <li>Software designed to infringe upon third-party copyrights or patents.</li>
                  </ul>
                  <p>
                    We actively monitor syntax request rates and enforce guardrails. Accounts found systematically violating safety limits may have their AI usage revoked.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Security */}
              <section id="security" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">6. Security Safeguards</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We apply multiple defense layers to keep your session secure:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Encryption:</strong> All telemetry and prompts are encrypted in transit using TLS 1.3 and at rest using AES-256.</li>
                    <li><strong className="text-foreground">Sandboxed Previews:</strong> Any web preview or code compilation runs in isolated web environments, preventing malicious runtime access.</li>
                    <li><strong className="text-foreground">Token Sanitization:</strong> Our APIs filter out API tokens, bearer keys, and critical configuration environment variables before they are forwarded to models.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Updates */}
              <section id="updates" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <RefreshCw className="size-5 text-primary animate-spin-slow" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">7. Policy Updates</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    As generative AI regulations (e.g., the EU AI Act, FTC directives) and best practices continue to evolve, we will update this policy accordingly. Any changes will be published directly on this page.
                  </p>
                  <p className="text-sm text-muted-foreground/80">
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

