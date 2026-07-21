'use client'

import { useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingCart, Link as LinkIcon, MessageSquare, KanbanSquare, LineChart, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const templates = [
  {
    id: 'saas-admin',
    title: 'SaaS Admin Dashboard',
    description: 'A modern admin panel with charts, data tables, and a responsive sidebar layout.',
    icon: LayoutDashboard,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    prompt: 'Build a modern SaaS Admin Dashboard. Include a responsive sidebar navigation on the left, and a top header with user profile and notifications. The main content area should have 3 KPI metric cards at the top (Total Revenue, Active Users, New Signups). Below the KPI cards, add a placeholder for a large Line Chart showing revenue over time. At the bottom, add a Data Table listing recent user transactions with columns for Name, Amount, Date, and Status badges (Completed, Pending, Failed). Use a clean, professional color palette suitable for a B2B SaaS.'
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Store',
    description: 'A product grid with filtering, shopping cart slider, and beautiful product cards.',
    icon: ShoppingCart,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    prompt: 'Build an E-Commerce Storefront homepage. At the top, create a navigation bar with a logo, search input, and a shopping cart icon with a badge showing 2 items. Below the nav, add a hero section highlighting a summer sale. The main section should feature a grid of product cards. Each product card should have an image placeholder, title, price, star rating, and an "Add to Cart" button. Add a sidebar on the left with filters for Category, Price Range, and Brand. Ensure the design feels premium and modern.'
  },
  {
    id: 'link-in-bio',
    title: 'Link-in-bio Profile',
    description: 'A sleek, mobile-first personal portfolio perfect for social media creators.',
    icon: LinkIcon,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    prompt: 'Build a Link-in-bio profile page optimized for mobile devices. Center everything. At the top, add a circular profile picture, a name (e.g., Jane Doe), a short bio, and social media icon links (Twitter, Instagram, GitHub). Below that, create a list of full-width buttons linking to various content (e.g., "My Latest Video", "Read my Blog", "Buy my Course"). Apply a sleek, aesthetic background gradient. The buttons should have a hover animation.'
  },
  {
    id: 'ai-chat',
    title: 'AI Chat Interface',
    description: 'A ChatGPT-style layout with message history and a fixed input area.',
    icon: MessageSquare,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    prompt: 'Build an AI Chat Interface similar to ChatGPT. It should have a sidebar on the left showing a list of recent chat history. The main area should display a conversation thread with distinct styles for "User" messages (aligned right or distinct background) and "AI" messages (aligned left). At the absolute bottom of the main area, create a sticky input bar with a text area, an attachment icon, and a send button. Ensure the message history area is scrollable while the input bar remains fixed.'
  },
  {
    id: 'kanban',
    title: 'Kanban Task Board',
    description: 'A project management board with To Do, In Progress, and Done columns.',
    icon: KanbanSquare,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    prompt: 'Build a Kanban Task Board for project management. The layout should scroll horizontally if needed. Create 3 columns: "To Do", "In Progress", and "Done". Each column should have a distinct colored header and contain several Task Cards. Each Task Card should display a title, a short description, a priority badge (High, Medium, Low), and an avatar of the assigned user. Add an "+ Add Task" button at the bottom of each column. Make the interface look clean and organized like Trello or Linear.'
  },
  {
    id: 'finance',
    title: 'Personal Finance Tracker',
    description: 'A budgeting dashboard tracking monthly expenses and savings goals.',
    icon: LineChart,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    prompt: 'Build a Personal Finance Tracker dashboard. The top section should prominently display "Total Balance", "Monthly Income", and "Monthly Expenses" in large typography. Below that, create a two-column layout. The left column should show a list of recent transactions (e.g., Groceries, Rent, Netflix) with dates and amounts (green for income, red for expenses). The right column should display "Savings Goals" with progress bars showing how close the user is to their goals (e.g., Vacation Fund, Emergency Fund). Use a clean, modern aesthetic.'
  }
]

export default function TemplatesPage() {
  const router = useRouter()

  const handleTemplateClick = (prompt: string) => {
    // Navigate to the project builder and pass the prompt in the URL
    router.push(`/dashboard/project-builder?idea=${encodeURIComponent(prompt)}`)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 pt-16 lg:pt-8 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Templates Library</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Don't start from scratch. Choose a starter kit below and let the AI generate the foundation instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="group relative cursor-pointer overflow-hidden border border-border/50 bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300"
              onClick={() => handleTemplateClick(template.prompt)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader>
                <div className={`mb-4 inline-flex p-3 rounded-xl ${template.bgColor}`}>
                  <template.icon className={`size-6 ${template.color}`} />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {template.title}
                </CardTitle>
                <CardDescription className="text-sm mt-2 line-clamp-2 leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center text-sm font-medium text-primary mt-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Build this project
                  <ArrowRight className="ml-1 size-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
