'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const DOCS_NAV = [
  {
    title: 'Getting Started',
    items: [
      { title: 'What is CodewithChat?', href: '/docs' },
      { title: 'Agentic features', href: '/docs/agentic-features' },
      { title: 'Sandbox', href: '/docs/sandbox' },
      { title: 'Vercel Integration', href: '/docs/vercel-integration' },
      { title: 'Quickstart', href: '/docs/quickstart' },
      { title: 'FAQs', href: '/docs/faqs' },
    ]
  },
  {
    title: 'Prompt',
    items: [
      { title: 'Text Prompting', href: '/docs/text-prompting' },
      { title: 'Screenshots and Files', href: '/docs/screenshots-files' },
      { title: 'Figma', href: '/docs/figma' },
    ]
  },
  {
    title: 'Iterate',
    items: [
      { title: 'Code editing', href: '/docs/code-editing' },
      { title: 'Terminal commands', href: '/docs/terminal-commands' },
      { title: 'Design mode', href: '/docs/design-mode' },
      { title: 'Design systems', href: '/docs/design-systems' },
      { title: 'Images and videos', href: '/docs/images-videos' },
      { title: 'Versions', href: '/docs/versions' },
    ]
  }
]

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-full">
      {DOCS_NAV.map((group, index) => (
        <div key={index} className="pb-8">
          <h4 className="mb-3 text-sm font-semibold text-foreground tracking-tight">
            {group.title}
          </h4>
          <div className="grid grid-flow-row auto-rows-max text-sm">
            {group.items.map((item, itemIndex) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={cn(
                    "flex w-full items-center rounded-md border border-transparent py-1.5 text-muted-foreground hover:text-foreground transition-colors",
                    isActive && "text-foreground font-medium"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
