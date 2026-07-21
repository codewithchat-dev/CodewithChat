export type Tool = {
  name: string
  category: string
  purpose: string
  whenToUse: string
  href: string
}

export const tools: Tool[] = [
  {
    name: 'Next.js',
    category: 'Framework',
    purpose: 'Full-stack React framework with server rendering, routing, and API routes.',
    whenToUse:
      'Use as the foundation for almost any SaaS web app. Great when you need SEO, server components, and a single codebase for frontend and backend.',
    href: 'https://nextjs.org',
  },
  {
    name: 'Supabase',
    category: 'Database & Auth',
    purpose: 'Hosted Postgres database with authentication, storage, and realtime APIs.',
    whenToUse:
      'Reach for it when you want a relational database plus auth without managing servers. Ideal for MVPs that may scale later.',
    href: 'https://supabase.com',
  },
  {
    name: 'Neon',
    category: 'Database',
    purpose: 'Serverless Postgres with branching and autoscaling.',
    whenToUse:
      'Choose when you want pure Postgres with database branching for preview environments and pay-for-what-you-use pricing.',
    href: 'https://neon.tech',
  },
  {
    name: 'Drizzle ORM',
    category: 'Data Access',
    purpose: 'Type-safe SQL query builder and schema toolkit for TypeScript.',
    whenToUse:
      'Add it when you want end-to-end type safety between your database schema and application code without heavy abstractions.',
    href: 'https://orm.drizzle.team',
  },
  {
    name: 'Upstash Redis',
    category: 'Caching',
    purpose: 'Serverless Redis for caching, rate limiting, and sessions.',
    whenToUse:
      'Introduce it once you need rate limiting, caching of expensive queries, or ephemeral state like queues and sessions.',
    href: 'https://upstash.com',
  },
  {
    name: 'Stripe',
    category: 'Payments',
    purpose: 'Payments, subscriptions, and billing infrastructure.',
    whenToUse:
      'Use the moment you need to charge customers. Stripe Checkout and the Customer Portal cover most subscription billing needs.',
    href: 'https://stripe.com',
  },
  {
    name: 'Vercel',
    category: 'Deployment',
    purpose: 'Deployment platform for frontend frameworks with global edge network.',
    whenToUse:
      'Deploy here for zero-config hosting, preview deployments per pull request, and tight Next.js integration.',
    href: 'https://vercel.com',
  },
  {
    name: 'Cloudflare Turnstile',
    category: 'Security',
    purpose: 'Privacy-friendly CAPTCHA alternative to block bots.',
    whenToUse:
      'Add to sign-up and contact forms to stop automated abuse without hurting the experience for real users.',
    href: 'https://developers.cloudflare.com/turnstile',
  },
  {
    name: 'Resend',
    category: 'Email',
    purpose: 'Developer-first transactional email API with React email support.',
    whenToUse:
      'Use for verification emails, password resets, and receipts once your product has real users.',
    href: 'https://resend.com',
  },
]

export type BuildStep = {
  id: number
  title: string
  summary: string
  details: string[]
  tools: string[]
}

export const buildSteps: BuildStep[] = [
  {
    id: 1,
    title: 'Set up the project',
    summary: 'Create the repository, install the framework, and configure your tooling.',
    details: [
      'Initialize a Next.js App Router project with TypeScript and Tailwind CSS.',
      'Set up version control with Git and push to GitHub.',
      'Configure environment variables and a .env.local file for secrets.',
      'Add formatting and linting (Prettier, ESLint) so the team writes consistent code.',
    ],
    tools: ['Next.js', 'Vercel'],
  },
  {
    id: 2,
    title: 'Create the UI',
    summary: 'Build the core pages and a reusable component system before wiring up data.',
    details: [
      'Scaffold the main routes: landing page, auth screens, and the dashboard shell.',
      'Install a component library so you do not reinvent buttons, inputs, and dialogs.',
      'Design mobile-first, then layer in tablet and desktop breakpoints.',
      'Keep components small and composable to make later changes painless.',
    ],
    tools: ['Next.js'],
  },
  {
    id: 3,
    title: 'Set up the database',
    summary: 'Model your data and connect a real database instead of mock state.',
    details: [
      'Sketch your tables and relationships before writing migrations.',
      'Provision a Postgres database and connect it through a type-safe data layer.',
      'Write migrations so schema changes are versioned and repeatable.',
      'Seed sample data so you can develop against realistic content.',
    ],
    tools: ['Supabase', 'Neon', 'Drizzle ORM'],
  },
  {
    id: 4,
    title: 'Add authentication',
    summary: 'Let users sign up, sign in, and access only their own data.',
    details: [
      'Start with email and password authentication before adding social logins.',
      'Protect server actions and API routes by checking the session on every request.',
      'Scope every database query to the authenticated user to prevent data leaks.',
      'Add bot protection to your auth forms.',
    ],
    tools: ['Supabase', 'Cloudflare Turnstile'],
  },
  {
    id: 5,
    title: 'Build core features',
    summary: 'Implement the workflows that deliver your product’s main value.',
    details: [
      'Prioritize the single workflow that defines your MVP and ship it end-to-end.',
      'Add caching and rate limiting around expensive or abuse-prone endpoints.',
      'Wire up billing once users get value and are ready to pay.',
      'Instrument key actions so you can measure activation and retention.',
    ],
    tools: ['Upstash Redis', 'Stripe'],
  },
  {
    id: 6,
    title: 'Deploy',
    summary: 'Ship to production with previews, monitoring, and transactional email.',
    details: [
      'Connect the repository to a hosting platform for automatic preview deployments.',
      'Move secrets into the platform’s environment variable manager.',
      'Set up transactional email for verification and notifications.',
      'Add basic analytics and error monitoring before announcing your launch.',
    ],
    tools: ['Vercel', 'Resend'],
  },
]

export type Project = {
  id: string
  name: string
  description: string
  stack: string[]
  progress: number
  stage: string
  updated: string
}

export const recentProjects: Project[] = [
  {
    id: 'taskflow',
    name: 'TaskFlow',
    description: 'Team task manager with shared boards and due-date reminders.',
    stack: ['Next.js', 'Supabase', 'Stripe'],
    progress: 72,
    stage: 'Build core features',
    updated: '2 hours ago',
  },
  {
    id: 'inboxzero',
    name: 'InboxZero',
    description: 'AI email triage assistant that drafts replies for support teams.',
    stack: ['Next.js', 'Neon', 'Upstash Redis'],
    progress: 40,
    stage: 'Set up the database',
    updated: 'Yesterday',
  },
  {
    id: 'ledgerly',
    name: 'Ledgerly',
    description: 'Lightweight invoicing and expense tracking for freelancers.',
    stack: ['Next.js', 'Supabase'],
    progress: 18,
    stage: 'Create the UI',
    updated: '3 days ago',
  },
]

export type Testimonial = {
  quote: string
  name: string
  role: string
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'I shipped my first real SaaS in a month. The step-by-step plan removed the guesswork I used to get stuck on.',
    name: 'Rohit Bansal',
    role: 'Student',
  },
  {
    quote:
      'The system design breakdowns finally made backend architecture click for me. It reads like a senior engineer pairing with you.',
    name: 'Ome Tiwari',
    role: 'Student',
  },
  {
    quote:
      'Clear, practical, and opinionated in the right places. It recommends real tools and tells you exactly when to use them.',
    name: 'Rajat Garg',
    role: 'Student',
  },
]
