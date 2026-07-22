import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { AnimatedBackground } from '@/components/landing/animated-background'
import { 
  FileText, 
  Scale, 
  HelpCircle, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle,
  UserCheck,
  Mail
} from 'lucide-react'

export const metadata = {
  title: 'Terms of Service | CodewithChat',
  description: 'Read the rules, rights, and legal guidelines governing your use of the CodewithChat platform.',
}

export default function TermsPage() {
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
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium w-fit mb-6 animate-pulse">
              <Scale className="size-3.5" />
              <span>Platform Agreement</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Welcome to CodewithChat. Please review the rules, guidelines, and legal frameworks 
              that govern your access and use of our platform.
            </p>

            {/* Terms Feature Grid */}
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
                  <UserCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Fair & Safe Conduct</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">We expect all builders to avoid using the platform for malicious code generation or abusive rates.</p>
              </div>
              
              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">IP Rights Retained</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">You retain full, exclusive ownership of any application code or designs created on our service.</p>
              </div>

              <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500 mb-4">
                  <CreditCard className="size-5" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Clear Billing</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">Simple pay-as-you-go subscriptions. Cancel anytime through your customer billing dashboard.</p>
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
                  { id: 'agreement', label: '1. Agreement of Use' },
                  { id: 'accounts', label: '2. User Accounts' },
                  { id: 'license-conduct', label: '3. Conduct & License' },
                  { id: 'ai-outputs', label: '4. AI Generated Code' },
                  { id: 'subscriptions', label: '5. Billing & Cancellations' },
                  { id: 'disclaimers', label: '6. Disclaimer of Warranties' },
                  { id: 'liability', label: '7. Limitation of Liability' },
                  { id: 'governing-law', label: '8. Governing Law' },
                  { id: 'contact', label: '9. Contact Us' }
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
              
              {/* Agreement of Use */}
              <section id="agreement" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <FileText className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">1. Acceptance of Terms</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    By accessing, registering, or using the CodewithChat website, software, or integrations, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                  </p>
                  <p>
                    If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* User Accounts */}
              <section id="accounts" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <UserCheck className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">2. User Accounts & Registration</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    To access the AI-assisted code generation platform, you must create a verified user account.
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Authentication:</strong> Account validation is managed through Clerk. You agree to safeguard your password and credentials.</li>
                    <li><strong className="text-foreground">Accuracy:</strong> You must provide current, complete, and accurate information during the sign-up process.</li>
                    <li><strong className="text-foreground">Security Breaches:</strong> You are responsible for any activities occurring under your account. Notify us immediately if you suspect unauthorized access.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Conduct & License */}
              <section id="license-conduct" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Scale className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">3. Platform Conduct & Usage License</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We grant you a personal, non-transferable, revocable license to access our editor, chat interface, and template workspace in accordance with these Terms. Under this license, you may not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>Decompile, reverse-engineer, or attempt to extract the proprietary source code of the CodewithChat orchestrator and backend servers.</li>
                    <li>Use our AI services to systematically scrape, extract, or hoard raw dataset parameters to train competing programming LLMs.</li>
                    <li>Bypass, disable, or circumvent safety filters, API request limits, or user authentication headers.</li>
                    <li>Deploy automated bots to generate accounts or submit massive concurrent prompts.</li>
                  </ul>
                  <p>
                    Violations of acceptable conduct will result in immediate termination of account access without refunds.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* AI Generated Code */}
              <section id="ai-outputs" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">4. AI-Generated Output & Ownership</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    The relationships and terms regarding synthesized software output are governed as follows:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Sovereign Rights:</strong> You own all intellectual property rights, file repositories, and distribution rights to the code snippets or apps synthesized for you.</li>
                    <li><strong className="text-foreground">No Representation:</strong> CodewithChat does not guarantee that the generated code is error-free, secure, or free from functional regressions.</li>
                    <li><strong className="text-foreground">Developer Responsibility:</strong> You are responsible for ensuring that your code behaves correctly in local environments and production stacks.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Billing & Cancellations */}
              <section id="subscriptions" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <CreditCard className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">5. Subscriptions, Payments & Cancellations</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    We offer subscription plans with monthly or annual billing terms:
                  </p>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong className="text-foreground">Payment Processor:</strong> All processing is done through Stripe. Recurring charges are collected at the start of each billing cycle.</li>
                    <li><strong className="text-foreground">Cancellation:</strong> You can cancel your subscription at any time. You will continue to have access to the premium tiers until the end of your current cycle.</li>
                    <li><strong className="text-foreground">Refund Policy:</strong> Refunds are handled on a case-by-case basis. If you are dissatisfied with our service, contact billing support within 14 days of purchase.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Disclaimer */}
              <section id="disclaimers" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <AlertTriangle className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">6. Disclaimer of Warranties</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p className="bg-muted/40 p-4 rounded-xl border border-border text-foreground font-medium">
                    THE MATERIALS AND SERVICES ON CODEWITHCHAT'S WEBSITE ARE PROVIDED ON AN 'AS IS' AND 'AS AVAILABLE' BASIS. CODEWITHCHAT MAKES NO WARRANTIES, EXPRESSED OR IMPLIED, AND HEREBY DISCLAIMS AND NEGATES ALL OTHER WARRANTIES INCLUDING, WITHOUT LIMITATION, IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT OF INTELLECTUAL PROPERTY.
                  </p>
                  <p>
                    Further, CodewithChat does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of materials on its website or otherwise relating to such materials or on any sites linked to this site.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Limitation of Liability */}
              <section id="liability" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <HelpCircle className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">7. Limitation of Liability</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    IN NO EVENT SHALL CODEWITHCHAT, ITS PARTNERS, OR ITS SERVICE PROVIDERS BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF DATA OR PROFIT, OR DUE TO BUSINESS INTERRUPTION) ARISING OUT OF THE USE OR INABILITY TO USE CODEWITHCHAT'S SERVICE, EVEN IF CODEWITHCHAT HAS BEEN NOTIFIED ORALLY OR IN WRITING OF THE POSSIBILITY OF SUCH DAMAGE.
                  </p>
                  <p>
                    Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Governing Law */}
              <section id="governing-law" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Scale className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">8. Governing Law</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    These terms and conditions are governed by and construed in accordance with the local laws governing our company registration, without regard to its conflict of law provisions.
                  </p>
                  <p>
                    You irrevocably submit to the exclusive jurisdiction of the state and federal courts in that region to resolve any dispute arising from this agreement.
                  </p>
                </div>
              </section>

              <hr className="border-border/40" />

              {/* Contact Us */}
              <section id="contact" className="scroll-mt-28 group">
                <div className="flex items-center gap-2 text-foreground mb-4">
                  <Mail className="size-5 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight text-foreground m-0">9. Contact Us</h2>
                </div>
                <div className="space-y-4 text-base leading-relaxed">
                  <p>
                    If you have questions about these Terms of Service or need help with your account billing, please contact us:
                  </p>
                  <p className="flex items-center gap-2 text-foreground font-semibold">
                    <Mail className="size-4 text-primary" />
                    <span>support@codewithchat.com</span>
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

