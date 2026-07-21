import { google } from '@ai-sdk/google'
import { auth, currentUser } from '@clerk/nextjs/server'
import { streamObject } from 'ai'
import { planSchema } from '@/lib/schema'

import { db } from '@/lib/db'
import { MAX_DAILY_CREDITS } from '@/lib/credits'

export const maxDuration = 300

async function consumeGenerationCredit() {
  const { userId } = await auth()
  if (!userId) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }

  let dbUser = await db.user.findUnique({ where: { clerkId: userId } })
  if (!dbUser) {
    const user = await currentUser()
    dbUser = await db.user.create({
      data: {
        clerkId: userId,
        email: user?.emailAddresses[0]?.emailAddress || '',
        credits: MAX_DAILY_CREDITS,
      },
    })
  }

  if (dbUser.credits <= 0) {
    return { ok: false as const, status: 402, error: 'NO_CREDITS', credits: 0 }
  }

  const updated = await db.user.update({
    where: { id: dbUser.id },
    data: { credits: { decrement: 1 } },
  })

  return { ok: true as const, credits: updated.credits }
}

export async function POST(req: Request) {
  try {
    const { idea, tech, platform, messages = [], existingPlan } = await req.json()

    if (!idea) {
      return new Response(JSON.stringify({ error: 'Missing idea' }), { status: 400 })
    }

    const creditResult = await consumeGenerationCredit()
    if (!creditResult.ok) {
      return new Response(
        JSON.stringify({ error: creditResult.error, credits: creditResult.credits ?? 0 }),
        { status: creditResult.status, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const result = await streamObject({
      model: google('gemini-2.5-flash'),
      system: `You are an expert AI frontend engineer and startup CTO. Your job is to take a user's SaaS app idea and generate TWO things:
1. An actionable step-by-step coding guide.
2. A COMPLETE, PRODUCTION-READY full-stack project in the \`fullStackFiles\` array (using Next.js App Router, TypeScript, Supabase, and Vercel AI SDK).

LEAVE \`previewFiles\` EMPTY. We no longer use it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES FOR fullStackFiles (NEXT.JS + SUPABASE PRODUCTION STACK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The \`fullStackFiles\` array is what the user will download and deploy to Vercel. It MUST be a complete, working Next.js App Router project.
✅ STACK: Next.js (App Router), TypeScript, TailwindCSS, Supabase (for Auth & DB), Vercel AI SDK (if AI is needed).
✅ REQUIRED FILES: You must generate all essential files including:
   - \`/package.json\` (CRITICAL: Must use "next": "14.2.3" and "@next/swc-wasm-nodejs": "14.2.3" in dependencies. Set dev script to "NEXT_SWC_WASM_ENABLE=1 next dev".)
   - \`/tsconfig.json\` (MUST be valid JSON — NO trailing commas, NO comments. Use moduleResolution "bundler".)
   - \`/tailwind.config.ts\`
   - \`/app/layout.tsx\` and \`/app/page.tsx\`
   - \`/lib/supabase.ts\` (Supabase client setup)
   - \`/app/api/.../route.ts\` (if they need backend APIs or Vercel AI streamText)
⚠️ NEVER use \`experimental: { serverActions: true }\` in next.config — Server Actions are enabled by default in Next.js 14.2+. Do NOT set experimental.serverActions at all.
✅ PRODUCTION QUALITY: Do not use placeholders. Write robust, clean, and typed code. Structure the app properly with \`/components\`, \`/lib\`, and \`/app\`.
✅ REAL CONTENT: Ensure the generated codebase matches the user's SaaS idea perfectly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN & UI AESTHETICS (PREMIUM, PRODUCTION-READY QUALITY):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DARK MODE DEFAULT: Force a sleek dark mode aesthetic by default using \`bg-neutral-950 text-white\`.
🎨 SHADCN UI COMPONENT DESIGN: You must manually build Shadcn-like components (Buttons, Cards, Dialogs, Badges, Inputs, etc.) using extensive Tailwind utility classes.
🎨 MODERN TAILWIND: Use rounded corners (rounded-xl, rounded-2xl), subtle borders (border-white/10), soft shadows (shadow-sm, shadow-lg), and gradients (bg-gradient-to-r).
🎨 GLASSMORPHISM: Use backdrop-blur (backdrop-blur-md, bg-black/50) for sticky navbars and overlays.
🎨 MICRO-ANIMATIONS: Use transition-all duration-300, hover:scale-105, hover:bg-white/10 for interactive elements to make the UI feel premium and alive.
🎨 ICONS: Extensively use 'lucide-react' for all iconography to make the app look professional.
🎨 IMAGES (CRITICAL): NEVER generate base64 image strings. EVER. ALWAYS use real, high-quality image URLs from Unsplash (e.g., https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000).
🎨 TYPOGRAPHY & SPACING: Ensure plenty of whitespace (p-8, gap-6). Use tracking-tight for headings. Make it look like a real, funded startup.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OTHER RULES & STRICT STACK ENFORCEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- IMPORTANT: IGNORING USER TECH STACK. Even if the user requests Vue, Angular, Python, Django, or anything else, you MUST IGNORE their tech stack request.
- You MUST ALWAYS write the \`fullStackFiles\` using exactly: Next.js (App Router) + TypeScript + TailwindCSS + Supabase + Vercel AI SDK. NO EXCEPTIONS.
- Platform context: ${platform} (Adapt the design for this platform, but keep the Next.js stack).
- If the user sends an UPDATE request (chat history below), MODIFY the existing project — do NOT start from scratch. Keep working files unless the user asks to remove them.
- When updating: merge changes into fullStackFiles. Fix imports, add missing files, preserve what still works.`,
      messages: [
        { role: 'user', content: `Idea: ${idea}\nPlatform: ${platform}\n[CRITICAL INSTRUCTION]: I might have selected "${tech}" as my preferred stack, but you MUST IGNORE THIS. Strictly use the Next.js + Supabase stack for fullStackFiles as instructed in the system prompt.` },
        ...(existingPlan
          ? [{
              role: 'user' as const,
              content: `EXISTING PROJECT CODE (modify this, do not discard unless asked):\n${JSON.stringify(existingPlan)}`,
            }]
          : []),
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        })),
      ],
      schema: planSchema
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('AI Generation Error Details:', error)
    const errorMessage = error?.message || 'Unknown error occurred'
    return new Response(JSON.stringify({ error: 'Failed to generate plan', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
