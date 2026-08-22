export type Tool = {
  name: string
  category: string
  purpose: string
  whenToUse: string
  href: string
}

export const tools: Tool[] = [
  {
    name: 'React',
    category: 'Frontend',
    purpose:
      'Component-based library for building interactive web interfaces.',
    whenToUse:
      'Used as the foundation of CodewithChat generated web applications.',
    href: 'https://react.dev',
  },
  {
    name: 'Vite',
    category: 'Build Tool',
    purpose:
      'Fast development server and production build tool for modern web apps.',
    whenToUse:
      'Used by default for fast local development, HMR, and production builds.',
    href: 'https://vite.dev',
  },
  {
    name: 'TypeScript',
    category: 'Language',
    purpose:
      'Typed JavaScript that improves reliability and developer tooling.',
    whenToUse:
      'Used by default in generated projects for safer and more maintainable code.',
    href: 'https://www.typescriptlang.org',
  },
  {
    name: 'Tailwind CSS',
    category: 'Styling',
    purpose:
      'Utility-first CSS framework for building responsive interfaces quickly.',
    whenToUse:
      'Used for the visual system, responsive layouts, and reusable UI styling.',
    href: 'https://tailwindcss.com',
  },
  {
    name: 'Supabase',
    category: 'Backend & Auth',
    purpose:
      'Hosted Postgres database with authentication, storage, realtime, and Edge Functions.',
    whenToUse:
      'Use when a generated application needs authentication, persistent data, storage, realtime features, or backend functionality.',
    href: 'https://supabase.com',
  },
  {
    name: 'Stripe',
    category: 'Payments',
    purpose:
      'Payments, subscriptions, checkout, and billing infrastructure.',
    whenToUse:
      'Use when an application needs paid plans, subscriptions, or online payments.',
    href: 'https://stripe.com',
  },
  {
    name: 'Upstash Redis',
    category: 'Caching',
    purpose:
      'Serverless Redis for caching, rate limiting, queues, and temporary state.',
    whenToUse:
      'Use for rate limiting, caching expensive operations, or temporary application state.',
    href: 'https://upstash.com',
  },
  {
    name: 'Cloudflare Turnstile',
    category: 'Security',
    purpose:
      'Privacy-friendly bot protection for forms and authentication flows.',
    whenToUse:
      'Add when public forms or authentication endpoints need protection from automated abuse.',
    href: 'https://developers.cloudflare.com/turnstile',
  },
  {
    name: 'Resend',
    category: 'Email',
    purpose:
      'Developer-focused transactional email service.',
    whenToUse:
      'Use for verification emails, notifications, password recovery, and transactional messages.',
    href: 'https://resend.com',
  },
  {
    name: 'Vercel',
    category: 'Deployment',
    purpose:
      'Cloud platform for deploying modern frontend applications.',
    whenToUse:
      'Use when you want Git-based deployments, preview URLs, custom domains, and CDN delivery.',
    href: 'https://vercel.com',
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
    title: 'Generate the project',
    summary:
      'Create a complete production-ready React project from your idea.',
    details: [
      'Generate a React + Vite + TypeScript project.',
      'Create the required project configuration files.',
      'Configure Tailwind CSS and the global design system.',
      'Generate a clean component and folder structure.',
    ],
    tools: [
      'React',
      'Vite',
      'TypeScript',
      'Tailwind CSS',
    ],
  },
  {
    id: 2,
    title: 'Build the interface',
    summary:
      'Create responsive pages and reusable components for the product.',
    details: [
      'Generate the main pages and application layout.',
      'Create reusable components instead of duplicating UI.',
      'Use responsive layouts for mobile, tablet, and desktop.',
      'Add polished loading, empty, hover, and interaction states.',
    ],
    tools: [
      'React',
      'Tailwind CSS',
    ],
  },
  {
    id: 3,
    title: 'Connect the backend',
    summary:
      'Add real data, authentication, and storage when the application requires them.',
    details: [
      'Create the database schema required by the application.',
      'Generate versioned database migrations.',
      'Connect the frontend through a reusable Supabase client.',
      'Use Row Level Security to protect user data.',
    ],
    tools: ['Supabase'],
  },
  {
    id: 4,
    title: 'Add authentication',
    summary:
      'Add secure sign-up, sign-in, sessions, and protected application areas.',
    details: [
      'Create authentication screens and flows.',
      'Protect private application routes.',
      'Scope user data to the authenticated account.',
      'Add bot protection when appropriate.',
    ],
    tools: [
      'Supabase',
      'Cloudflare Turnstile',
    ],
  },
  {
    id: 5,
    title: 'Add product features',
    summary:
      'Implement the workflows and integrations that make the application useful.',
    details: [
      'Build the main product workflow end-to-end.',
      'Add payments only when the product requires billing.',
      'Use rate limiting or caching where appropriate.',
      'Add email notifications when the workflow requires them.',
    ],
    tools: [
      'Stripe',
      'Upstash Redis',
      'Resend',
    ],
  },
  {
    id: 6,
    title: 'Preview and deploy',
    summary:
      'Test the generated project and ship it to production.',
    details: [
      'Preview the generated application while building.',
      'Verify responsive behavior and interactions.',
      'Configure production environment variables.',
      'Deploy the finished repository to a hosting platform.',
    ],
    tools: [
      'Vite',
      'Vercel',
    ],
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
    description:
      'Team task manager with shared boards and due-date reminders.',
    stack: [
      'React',
      'Vite',
      'Supabase',
    ],
    progress: 72,
    stage: 'Build core features',
    updated: '2 hours ago',
  },
  {
    id: 'shopflow',
    name: 'ShopFlow',
    description:
      'Modern storefront with products, cart, accounts, and checkout.',
    stack: [
      'React',
      'Vite',
      'Supabase',
      'Stripe',
    ],
    progress: 45,
    stage: 'Connect the backend',
    updated: 'Yesterday',
  },
  {
    id: 'launchboard',
    name: 'LaunchBoard',
    description:
      'Clean SaaS dashboard with authentication and analytics.',
    stack: [
      'React',
      'Vite',
      'Supabase',
    ],
    progress: 20,
    stage: 'Build the interface',
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