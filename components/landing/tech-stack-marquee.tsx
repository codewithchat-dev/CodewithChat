'use client'

import React from 'react'

const technologies = [
  { name: 'React', icon: '⚛️' },
  { name: 'Next.js', icon: '▲' },
  { name: 'Tailwind CSS', icon: '🌊' },
  { name: 'TypeScript', icon: '📘' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'PostgreSQL', icon: '🐘' },
  { name: 'Prisma', icon: '◭' },
  { name: 'Supabase', icon: '⚡' },
  { name: 'Clerk', icon: '🔐' },
  { name: 'Stripe', icon: '💳' },
]

export function TechStackMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-border/50 bg-background/50 backdrop-blur-sm py-4">
      <div className="flex w-[200%] animate-marquee items-center gap-12 sm:gap-24">
        {/* We double the list to create a seamless loop */}
        {[...technologies, ...technologies].map((tech, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="text-xl grayscale transition-all hover:grayscale-0">
              {tech.icon}
            </span>
            <span className="text-sm font-medium tracking-wider uppercase">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
