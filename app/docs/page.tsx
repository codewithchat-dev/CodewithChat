import { DocsToc } from '@/components/docs/toc'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

const tocItems = [
  { id: 'what-is', title: 'What is CodewithChat?', level: 2 },
  { id: 'what-can-you-do', title: 'What can you do with CodewithChat?', level: 2 },
  { id: 'getting-started', title: 'Getting Started', level: 3 },
  { id: 'prompt-engineering', title: 'Prompt Engineering', level: 3 },
]

export default function DocsPage() {
  return (
    <div className="flex w-full py-8 lg:py-10 gap-10">
      
      {/* Main Documentation Content */}
      <div className="mx-auto w-full min-w-0 flex-1">
        <div className="space-y-10">
          
          <section id="what-is" className="scroll-mt-24">
            <h1 className="text-4xl font-bold tracking-tight mb-6">What is CodewithChat?</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              CodewithChat is an AI agent that helps anyone create real code and full-stack apps and agents.
            </p>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Ship features, refine designs, update copy, and create live prototypes, all with a prompt. Deploy to production immediately, or open a pull request for review.
            </p>
          </section>

          <section id="what-can-you-do" className="scroll-mt-24 pt-4">
            <h2 className="text-3xl font-bold tracking-tight mb-6">What can you do with CodewithChat?</h2>
            
            <ul className="space-y-4 text-base text-muted-foreground list-disc pl-6 marker:text-foreground">
              <li className="pl-2">
                <strong className="text-foreground font-semibold">Describe your idea</strong> in your preferred language.
              </li>
              <li className="pl-2">
                <strong className="text-foreground font-semibold">Create high-fidelity UIs</strong> from your wireframes or mockups.
              </li>
              <li className="pl-2">
                <strong className="text-foreground font-semibold">Connect to backend</strong> to build rich, data driven applications.
              </li>
              <li className="pl-2">
                <strong className="text-foreground font-semibold">Deploy with one click</strong> to secure, scalable infrastructure.
              </li>
              <li className="pl-2">
                <strong className="text-foreground font-semibold">Automatically fix errors</strong> in your code with intelligent diagnostics.
              </li>
            </ul>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <Link href="/docs/quickstart" className="group rounded-xl border border-border/50 bg-card p-6 transition-colors hover:bg-muted/50 hover:border-border">
                <h3 className="font-semibold mb-2 flex items-center justify-between">
                  Getting Started
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quickstart tutorial to create your first project.
                </p>
              </Link>
              
              <Link href="/docs/text-prompting" className="group rounded-xl border border-border/50 bg-card p-6 transition-colors hover:bg-muted/50 hover:border-border">
                <h3 className="font-semibold mb-2 flex items-center justify-between">
                  Prompt Engineering
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Build faster with effective prompting techniques.
                </p>
              </Link>
            </div>
          </section>

        </div>
      </div>

      {/* Right Sidebar (Table of Contents) */}
      <div className="hidden xl:block w-[240px] shrink-0">
        <div className="sticky top-24 pt-2">
          <DocsToc items={tocItems} />
          
          <div className="mt-10 border-t border-border pt-6 space-y-3">
            <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              Scroll to top
            </a>
            <a href="#" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Give feedback
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
