'use client'

import { useMemo } from 'react'
import {
  Rocket, Globe, Search, Gauge, ShieldCheck, Database,
  Package, GitBranch, Key, Lock, Zap,
  CheckCircle2, ExternalLink, BookOpen, Layers, Cpu,
  FileText, Copy, ChevronRight, Star
} from 'lucide-react'
import { toast } from 'sonner'
import { PublishProjectModal } from '@/components/dashboard/publish-project-modal'

interface PlanStep {
  title?: string
  description?: string
  codeSnippet?: string
  isCommand?: boolean
  fileTarget?: string
  link?: { text: string; url: string }
}

interface Plan {
  overview?: string
  steps?: (PlanStep | null | undefined)[]
  previewFiles?: ({ path?: string; content?: string } | null | undefined)[]
  fullStackFiles?: ({ path?: string; content?: string } | null | undefined)[]
  dependencies?: Record<string, string>
}

interface ProjectGuideProps {
  plan: Plan
  projectId: string
  idea: string
  tech: string
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const copy = () => {
    navigator.clipboard.writeText(code)
    toast.success('Copied to clipboard!')
  }
  return (
    <div className="relative rounded-lg border border-border bg-[#0d1117] overflow-hidden my-2">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{language}</span>
        <button onClick={copy} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          <Copy className="size-3" /> Copy
        </button>
      </div>
      <pre className="p-4 text-xs text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap break-words">{code}</pre>
    </div>
  )
}

function Section({ icon: Icon, title, color, children }: {
  icon: React.ElementType
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-border ${color}`}>
        <div className="size-8 rounded-lg bg-background/50 flex items-center justify-center">
          <Icon className="size-4" />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}

export function ProjectGuide({ plan, projectId, idea, tech }: ProjectGuideProps) {

  const projectType = useMemo(() => {
    const lower = idea.toLowerCase()
    if (lower.includes('ecommerce') || lower.includes('shop') || lower.includes('store') || lower.includes('product')) return 'ecommerce'
    if (lower.includes('blog') || lower.includes('cms') || lower.includes('article')) return 'blog'
    if (lower.includes('dashboard') || lower.includes('admin') || lower.includes('analytics')) return 'dashboard'
    if (lower.includes('portfolio') || lower.includes('resume') || lower.includes('personal')) return 'portfolio'
    if (lower.includes('saas') || lower.includes('subscription') || lower.includes('payment')) return 'saas'
    if (lower.includes('social') || lower.includes('chat') || lower.includes('message')) return 'social'
    return 'general'
  }, [idea])

  const packages = useMemo(() => {
    if (!plan.dependencies) return []
    return Object.entries(plan.dependencies).map(([name, version]) => ({ name, version }))
  }, [plan.dependencies])

  const envVars = useMemo(() => {
    const envFile = plan.fullStackFiles?.find(f => f?.path?.includes('.env'))
    if (envFile?.content) {
      return envFile.content.split('\n')
        .filter(line => line.includes('=') && !line.startsWith('#') && line.trim())
        .map(line => {
          const [key, ...rest] = line.split('=')
          return { key: key.trim(), example: rest.join('=').trim() || 'YOUR_VALUE_HERE' }
        })
    }
    const vars: { key: string; example: string }[] = [
      { key: 'NEXT_PUBLIC_SUPABASE_URL', example: 'https://your-project.supabase.co' },
      { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', example: 'your-anon-public-key-here' },
    ]
    if (projectType === 'ecommerce' || projectType === 'saas') {
      vars.push({ key: 'VITE_STRIPE_PUBLIC_KEY', example: 'pk_live_xxxxxxxxxxxx' })
    }
    return vars
  }, [plan.fullStackFiles, tech, projectType])

  const projectTypeConfig = useMemo(() => {
    const configs: Record<string, { title: string; description: string; steps: string[] }> = {
      ecommerce: {
        title: 'E-Commerce Website',
        description: 'You have built an e-commerce website with product listings, cart management, and payment processing. Complete the steps below before going live.',
        steps: [
          'Create a Stripe account and obtain live API keys — test keys only work in development',
          'Upload product images to a CDN like Cloudinary or AWS S3 — local images will not work in production',
          'Set up a MongoDB database to store cart items, orders, and user accounts',
          'Configure a payment webhook endpoint in the Stripe Dashboard to handle events',
          'Ensure your domain has an SSL certificate — payment processors require HTTPS',
        ]
      },
      blog: {
        title: 'Blog / CMS Website',
        description: 'You have built a blog or content management website. Connect a headless CMS to manage your content efficiently.',
        steps: [
          'Create a free account on Sanity.io or Contentful as your headless CMS',
          'Set up slug-based routing for individual blog post pages',
          'Automatically generate a sitemap.xml for better search engine indexing',
          'Add a comment system using Disqus or a custom MongoDB-based solution',
          'Add an RSS feed so readers can subscribe to new content',
        ]
      },
      portfolio: {
        title: 'Portfolio Website',
        description: 'You have built a personal portfolio website. Add a custom domain and proper SEO to make it stand out professionally.',
        steps: [
          'Purchase a custom domain (e.g., yourname.com) from Namecheap or GoDaddy',
          'Update all meta tags with your real name, profile photo, and description',
          'Add Google Analytics to track visitors and page views',
          'Set up a contact form using Resend or EmailJS',
          'Replace placeholder project links with real GitHub repository URLs',
        ]
      },
      dashboard: {
        title: 'Dashboard / Admin Panel',
        description: 'You have built a dashboard or admin panel. You will need a backend API and proper authentication to display real data.',
        steps: [
          'Implement authentication using NextAuth.js or Clerk',
          'Add role-based access control — not all users should have admin privileges',
          'Define your MongoDB data schemas clearly before storing production data',
          'Replace all dummy chart data with real API calls',
          'Add CSV or PDF export functionality for data reports',
        ]
      },
      saas: {
        title: 'SaaS Application',
        description: 'You have built a SaaS application. Subscription management, user accounts, and payments are the core features to get right.',
        steps: [
          'Set up Stripe Billing with monthly and yearly subscription plans',
          'Design a clear user onboarding flow: Sign Up → Payment → Dashboard',
          'Implement usage limits per plan (e.g., Free: 5 projects, Pro: unlimited)',
          'Configure transactional emails using Resend or SendGrid',
          'Add a customer support chat widget using Intercom or Crisp',
        ]
      },
      social: {
        title: 'Social / Chat Application',
        description: 'You have built a social or chat application. Real-time features require WebSocket or a managed service like Pusher.',
        steps: [
          'Implement real-time messaging with Pusher or Socket.io',
          'Set up Cloudinary for user profile pictures and media uploads',
          'Properly index message history in MongoDB for fast retrieval',
          'Configure Firebase Cloud Messaging for push notifications',
          'Add rate limiting to prevent spam and abuse',
        ]
      },
      general: {
        title: 'Web Application',
        description: 'You have built a web application. Follow the steps below to make it production-ready.',
        steps: [
          'Store all sensitive values in a .env file — never hardcode them in your source code',
          'Implement proper error handling with try/catch blocks throughout the application',
          'Build loading states and empty state UIs for a polished user experience',
          'Test your layout thoroughly on mobile devices and different screen sizes',
          'Connect a custom domain before sharing publicly',
        ]
      }
    }
    return configs[projectType] || configs.general
  }, [projectType])

  const gitignoreContent = `node_modules/
.env
.env.local
.env.production
.next/
dist/
build/
.DS_Store
*.log
.vercel`

  const envFileContent = envVars.map(v => `${v.key}=${v.example}`).join('\n')

  const gitCommands = `# Step 1: Create a new repository on github.com
# Go to github.com → New Repository → Create

# Step 2: Run these commands inside your project folder
git init
git add .
git commit -m "Initial commit"

# Step 3: Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main`

  const envExplanation: Record<string, string> = {
    MONGODB_URI: 'Get this from MongoDB Atlas — Cluster → Connect → Connect your application',
    STRIPE_SECRET_KEY: 'Get from Stripe Dashboard → Developers → API Keys',
    STRIPE_PUBLISHABLE_KEY: 'Get from Stripe Dashboard → Developers → API Keys',
    NEXTAUTH_SECRET: 'Generate a random string: run `openssl rand -base64 32` in your terminal',
    NEXT_PUBLIC_SITE_URL: 'The final URL of your website after deployment',
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-background/50">
      <div className="max-w-3xl mx-auto space-y-6 pb-12">

        {/* Header */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Rocket className="size-40" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-primary">Production Guide</h2>
          </div>
          <h3 className="font-semibold text-base mb-1">{projectTypeConfig.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[90%] relative z-10">
            {projectTypeConfig.description}
          </p>
        </div>

        {/* Project Overview */}
        {plan.overview && (
          <Section icon={Layers} title="What Was Built" color="bg-blue-500/5 text-blue-400">
            <p className="text-foreground">{plan.overview}</p>
          </Section>
        )}

        {/* Installed Packages */}
        {packages.length > 0 && (
          <Section icon={Package} title="Installed npm Packages" color="bg-purple-500/5 text-purple-400">
            <p>The following packages were automatically included in your project:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {packages.map(pkg => (
                <div key={pkg.name} className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-xs border border-border">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    <span className="font-mono text-foreground">{pkg.name}</span>
                  </div>
                  <span className="text-muted-foreground">{pkg.version}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border text-xs">
              <p className="font-medium text-foreground mb-1">To install all packages in your local VS Code project, run:</p>
              <CodeBlock code="npm install" language="terminal" />
            </div>
          </Section>
        )}

        {/* Environment Variables */}
        {envVars.length > 0 && (
          <Section icon={Key} title="Environment Variables (.env)" color="bg-amber-500/5 text-amber-400">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-3">
              <Lock className="size-4 shrink-0 mt-0.5" />
              <p><strong>Security Warning:</strong> Never hardcode these values directly in your source code. Always store them in a <code className="bg-black/30 px-1 rounded">.env.local</code> file and add it to <code className="bg-black/30 px-1 rounded">.gitignore</code>.</p>
            </div>
            <p>Create a file named <code className="bg-muted px-1 rounded text-foreground">.env.local</code> in your project root and add the following values:</p>
            <CodeBlock code={envFileContent} language=".env.local" />
            <div className="space-y-2 mt-2">
              {envVars.map(v => (
                <div key={v.key} className="flex items-start gap-3 text-xs">
                  <ChevronRight className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <span className="font-mono text-foreground font-medium">{v.key}</span>
                    <span className="ml-2 text-muted-foreground">
                      — {envExplanation[v.key] ?? 'Copy this value from your service dashboard'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* .gitignore */}
        <Section icon={FileText} title="What is .gitignore?" color="bg-slate-500/5 text-slate-400">
          <p>
            <strong className="text-foreground">.gitignore</strong> is a file that tells Git which files <strong className="text-red-400">not to upload</strong> to GitHub. The most important entries are:
          </p>
          <ul className="space-y-1 mt-2 text-xs">
            {[
              ['node_modules/', 'Contains millions of files — regenerated automatically with npm install'],
              ['.env / .env.local', 'Contains secret keys — must never be pushed to GitHub'],
              ['.next / dist / build', 'Build output files — automatically regenerated when deploying'],
            ].map(([file, desc]) => (
              <li key={file} className="flex items-start gap-2">
                <ChevronRight className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span><code className="text-foreground font-mono">{file}</code> — {desc}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs mt-2">This file is already included in your VS Code Export. Open <code className="bg-muted px-1 rounded text-foreground">.gitignore</code> in the project root to verify it contains:</p>
          <CodeBlock code={gitignoreContent} language=".gitignore" />
        </Section>

        {/* GitHub Push */}
        <Section icon={GitBranch} title="How to Push Code to GitHub" color="bg-green-500/5 text-green-400">
          <ol className="space-y-2 text-xs list-none">
            {[
              ['Step 1', 'Download the project ZIP using the Download button in the toolbar'],
              ['Step 2', 'Extract the ZIP and open the folder in VS Code'],
              ['Step 3', 'Open the terminal in VS Code and run npm install'],
              ['Step 4', 'Go to github.com → Click "New Repository" → Create it'],
              ['Step 5', 'Run the commands below one by one in your terminal'],
            ].map(([step, desc]) => (
              <li key={step} className="flex items-start gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{step}</span>
                <span>{desc}</span>
              </li>
            ))}
          </ol>
          <CodeBlock code={gitCommands} language="terminal" />
          <div className="flex items-center gap-2 mt-2">
            <ExternalLink className="size-3.5 text-muted-foreground shrink-0" />
            <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
              Create a new GitHub repository →
            </a>
          </div>
        </Section>

        {/* Project-Specific Steps */}
        <Section icon={Cpu} title={`${projectTypeConfig.title} — Important Next Steps`} color="bg-rose-500/5 text-rose-400">
          <p className="text-xs mb-3">These steps are specific to your project type. Complete them in order:</p>
          <ol className="space-y-3">
            {projectTypeConfig.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs">
                <span className="flex-shrink-0 size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* Database Setup — Supabase Only */}
        <Section icon={Database} title="Database Setup (Supabase)" color="bg-emerald-500/5 text-emerald-400">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="size-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">This project uses <strong className="text-foreground">Supabase</strong> — a free Postgres database with built-in Auth, Storage, and real-time subscriptions.</span>
          </div>
          <ol className="space-y-2 text-xs">
            {[
              { label: 'Create a free account', link: 'https://supabase.com', desc: '— Click "Start your project", no credit card needed' },
              { label: 'Create a New Project', link: null, desc: '— Give it a name, set a database password, choose a region' },
              { label: 'Get your API keys', link: null, desc: '— Project Settings → API → copy Project URL and anon public key' },
              { label: 'Install the client', link: null, desc: '— Run: npm install @supabase/supabase-js' },
              { label: 'Add env vars and connect', link: null, desc: '— See the code snippets below' },
            ].map(({ label, link, desc }, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 size-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px]">{i + 1}</span>
                <span>
                  {link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">{label}</a>
                  ) : (
                    <strong className="text-foreground">{label}</strong>
                  )}
                  {' '}{desc}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-foreground">.env.local file:</p>
            <CodeBlock code={`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`} language=".env.local" />
            <p className="text-xs font-medium text-foreground">lib/supabase.ts — connection file:</p>
            <CodeBlock code={`import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Fetch data example:
const { data, error } = await supabase.from('products').select('*')

// Insert data example:
const { error } = await supabase.from('orders').insert({ product_id: 1, qty: 2 })

// Auth example:
await supabase.auth.signUp({ email, password })
await supabase.auth.signInWithPassword({ email, password })`} language="typescript" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <ExternalLink className="size-3 text-muted-foreground" />
            <a href="https://supabase.com/docs" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Supabase Documentation →</a>
          </div>
        </Section>

        {/* Production Checklist */}
        <Section icon={Rocket} title="Pre-Launch Checklist" color="bg-primary/5 text-primary">
          <p className="text-xs mb-3">Verify each item before deploying your website:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Custom domain connected', icon: Globe, color: 'text-blue-400' },
              { label: 'SEO meta tags configured', icon: Search, color: 'text-emerald-400' },
              { label: 'Supabase URL & Anon Key set in .env', icon: Key, color: 'text-amber-400' },
              { label: '.env file added to .gitignore', icon: Lock, color: 'text-rose-400' },
              { label: 'Supabase tables created & tested', icon: Database, color: 'text-purple-400' },
              { label: 'Mobile responsiveness verified', icon: Gauge, color: 'text-cyan-400' },
              { label: 'Error handling implemented', icon: ShieldCheck, color: 'text-orange-400' },
              { label: 'Code pushed to GitHub', icon: GitBranch, color: 'text-green-400' },
            ].map(({ label, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-xs border border-border">
                <Icon className={`size-3.5 shrink-0 ${color}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Ready to Deploy */}
        <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold">Everything ready?</h4>
              <p className="text-xs text-muted-foreground">Complete the checklist above, then publish your project.</p>
            </div>
          </div>
          <PublishProjectModal projectId={projectId} />
        </div>

      </div>
    </div>
  )
}
