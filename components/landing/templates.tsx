'use client'

import { useRouter } from 'next/navigation'
import { useAuth, useClerk } from '@clerk/nextjs'

const TEMPLATES = [
  {
    title: 'SaaS Dashboard',
    description: 'A complete analytics dashboard with charts, data tables, and a sidebar navigation.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    prompt: 'Create a responsive SaaS analytics dashboard. It should have a dark mode sidebar, a top navigation bar with a user profile dropdown, and a main content area featuring KPI cards and a large Recharts line chart showing revenue over time. Add a data table at the bottom showing recent transactions.'
  },
  {
    title: 'E-Commerce Store',
    description: 'A modern storefront with a product grid, shopping cart, and checkout flow.',
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80',
    prompt: 'Build a modern e-commerce storefront landing page. It should have a hero section highlighting a new product, a grid of 6 featured products with images, titles, prices, and "Add to Cart" buttons. Include a shopping cart slide-over menu.'
  },
  {
    title: 'AI Chat Interface',
    description: 'A ChatGPT-style interface with a message history and input area.',
    image: 'https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&w=600&q=80',
    prompt: 'Create an AI chat interface similar to ChatGPT. It should have a left sidebar for chat history, and a main area showing a conversation between a user and an AI. Pin a text input area with a submit button to the bottom of the screen.'
  },
  {
    title: 'Portfolio Website',
    description: 'A professional developer portfolio with projects and contact form.',
    image: 'https://images.unsplash.com/photo-1507238692062-7e1efcd92e07?auto=format&fit=crop&w=600&q=80',
    prompt: 'Build a minimalist software developer portfolio website. Include a hero section with a profile picture and bio, a "Projects" section with 3 project cards (image, description, tech stack tags), and a "Contact Me" section with a functional-looking form.'
  },
  {
    title: 'Documentation Site',
    description: 'A clean layout for reading API docs and code snippets.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    prompt: 'Design a clean documentation website layout. It needs a left sidebar with a hierarchical table of contents, a top bar with a search input, and a main content area demonstrating how to use an API, including a nicely formatted code block with syntax highlighting.'
  },
  {
    title: 'Financial Tracker',
    description: 'A personal finance app for tracking expenses and budgets.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80',
    prompt: 'Create a personal finance tracking dashboard. Include summary cards for Total Balance, Monthly Income, and Monthly Expenses. Add a visual budget breakdown using a pie chart, and a list of recent transactions with positive (green) and negative (red) amounts.'
  }
]

export function Templates() {
  const router = useRouter()
  const { userId } = useAuth()
  const clerk = useClerk()

  const handleTemplateClick = (prompt: string) => {
    const url = `/dashboard/project-builder?idea=${encodeURIComponent(prompt)}`
    if (userId) {
      router.push(url)
    } else {
      clerk.openSignIn({ forceRedirectUrl: url })
    }
  }

  return (
    <section className="pb-24 pt-10">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Start with a template</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEMPLATES.map((template, index) => (
            <div 
              key={index}
              onClick={() => handleTemplateClick(template.prompt)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative h-44 w-full overflow-hidden bg-muted">
                <img 
                  src={template.image} 
                  alt={template.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 pt-5">
                <h3 className="font-medium text-lg mb-2">{template.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
