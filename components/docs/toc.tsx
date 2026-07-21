'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  title: string
  level: number
}

interface DocsTocProps {
  items: TocItem[]
}

export function DocsToc({ items }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0% 0% -80% 0%' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">On this page</p>
      <ul className="m-0 list-none text-sm space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id
          return (
            <li key={item.id} className={cn("pt-1", item.level > 2 && "pl-4")}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "inline-block no-underline transition-colors hover:text-foreground",
                  isActive 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
