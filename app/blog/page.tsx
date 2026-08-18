import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'

import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'

const featuredPost = {
  title: 'The Future of Building Websites with AI',
  description:
    'AI is changing how ideas become software. Explore how modern developers can go from a simple concept to a production-ready website faster than ever.',
  category: 'AI & Development',
  date: 'Aug 18, 2026',
  readTime: '6 min read',
  slug: 'future-of-building-websites-with-ai',
}

const posts = [
  {
    title: 'How to Build a Website with AI in Minutes',
    description:
      'A practical guide to turning a simple idea into a complete, production-ready website using AI.',
    category: 'Tutorials',
    date: 'Aug 15, 2026',
    readTime: '5 min read',
    slug: 'build-website-with-ai',
  },
  {
    title: '10 AI Prompts Every Developer Should Know',
    description:
      'Practical prompting techniques to help you write better code, debug faster, and build smarter.',
    category: 'AI',
    date: 'Aug 12, 2026',
    readTime: '7 min read',
    slug: 'ai-prompts-for-developers',
  },
  {
    title: 'From Idea to Production with CodewithChat',
    description:
      'A look at how developers can turn an idea into a working application without slowing down the creative process.',
    category: 'Product',
    date: 'Aug 10, 2026',
    readTime: '6 min read',
    slug: 'idea-to-production',
  },
  {
    title: 'Why AI-Native Development Is Different',
    description:
      'The development workflow is changing. Here is what AI-native development means for modern builders.',
    category: 'Engineering',
    date: 'Aug 7, 2026',
    readTime: '8 min read',
    slug: 'ai-native-development',
  },
  {
    title: 'Building Better Products with AI',
    description:
      'AI is more than a coding assistant. Learn how to use it throughout the product-building process.',
    category: 'Product',
    date: 'Aug 4, 2026',
    readTime: '5 min read',
    slug: 'building-better-products-with-ai',
  },
  {
    title: 'The Developer Workflow Is Changing',
    description:
      'From writing code to testing and deployment, AI is reshaping the modern developer workflow.',
    category: 'Development',
    date: 'Aug 1, 2026',
    readTime: '6 min read',
    slug: 'developer-workflow-is-changing',
  },
]

const categories = [
  'All',
  'AI',
  'Development',
  'Tutorials',
  'Product',
  'Engineering',
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="pointer-events-none absolute left-1/2 top-[-180px] -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

          <div className="mx-auto max-w-6xl px-6 pb-20 pt-32 text-center lg:pb-24">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-3.5" />
              CodewithChat Blog
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Ideas, insights &{' '}
              <span className="text-primary">AI-powered development.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Practical guides, product insights, and ideas for developers
              building the next generation of software with AI.
            </p>
          </div>
        </section>

        {/* Featured article */}
        <section className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Featured
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Editor&apos;s pick
              </h2>
            </div>
          </div>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              {/* Featured visual */}
              <div className="relative min-h-[320px] overflow-hidden bg-muted/30 lg:min-h-[390px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.25),transparent_35%),radial-gradient(circle_at_80%_80%,hsl(var(--primary)/0.12),transparent_40%)]" />

                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.35)_1px,transparent_1px)] [background-size:48px_48px]" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative rounded-2xl border border-border/70 bg-background/80 px-10 py-8 text-center shadow-2xl backdrop-blur-xl">
                    <div className="text-xs font-semibold tracking-[0.25em] text-primary">
                      CODEWITHCHAT
                    </div>

                    <div className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                      Build with AI.
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      From idea to production.
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured content */}
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <span className="w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                  {featuredPost.category}
                </span>

                <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  {featuredPost.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                  {featuredPost.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {featuredPost.date}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm font-medium text-primary">
                  Read article
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Articles */}
        <section className="border-t border-border/50">
          <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">
                  Explore
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  Latest articles
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Learn about AI, development, product building, and
                  everything happening at CodewithChat.
                </p>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      index === 0
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* Card visual */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.16),transparent_40%),radial-gradient(circle_at_80%_80%,hsl(var(--primary)/0.08),transparent_45%)]" />

                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.4)_1px,transparent_1px)] [background-size:32px_32px]" />

                    <div className="absolute left-5 top-5 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
                      {post.category}
                    </div>

                    <ArrowUpRight className="absolute right-5 top-5 size-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />

                    <div className="absolute bottom-5 left-5 text-xs font-semibold tracking-wider text-foreground/70">
                      CWC
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold leading-6 tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {post.description}
                    </p>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="size-3.5" />
                          {post.readTime}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-primary">
                        Read more
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="border-t border-border/50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04] px-6 py-14 text-center sm:px-10">
              <div className="pointer-events-none absolute left-1/2 top-[-180px] h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

              <div className="relative">
                <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Stay ahead of the curve.
                </h2>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Get new articles, AI insights, product updates, and
                  practical development tips from CodewithChat.
                </p>

                <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                  />

                  <button
                    type="button"
                    className="h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Subscribe
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-muted-foreground">
                  No spam. Just useful stuff.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}