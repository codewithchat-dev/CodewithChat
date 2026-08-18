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

function parseMessageContent(content: string) {
  if (typeof content !== 'string' || !content.includes('[IMAGE: data:image/')) {
    return content;
  }
  const startIndex = content.indexOf('[IMAGE: ');
  const textPart = content.substring(0, startIndex).trim();
  const imagePartWithBracket = content.substring(startIndex + 8);
  const endIndex = imagePartWithBracket.indexOf(']');
  const imagePartStr = imagePartWithBracket.substring(0, endIndex).trim();
  
  const base64Data = imagePartStr.includes(',') ? imagePartStr.split(',')[1] : imagePartStr;

  return [
    ...(textPart ? [{ type: 'text' as const, text: textPart }] : []),
    { type: 'image' as const, image: base64Data }
  ];
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
2. A COMPLETE, PRODUCTION-READY React project in the \`previewFiles\` array (using React, TypeScript, and TailwindCSS).

LEAVE \`fullStackFiles\` EMPTY. We no longer use it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES FOR previewFiles (REACT + TYPESCRIPT + TAILWIND STACK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The \`previewFiles\` array is what the user will run in the browser using Sandpack. It MUST be a complete, working React SPA.
✅ STACK: React 18, TypeScript, TailwindCSS, lucide-react. (You may use standard React Router if routing is needed).
✅ REQUIRED FILES: You must generate all essential files including:
   - \`/App.tsx\` (CRITICAL: Main application logic - MUST be the entry point).
   - \`/index.css\` (Must include @tailwind directives: @tailwind base; @tailwind components; @tailwind utilities;).
   - All component files like \`/components/Navbar.tsx\`, \`/components/Hero.tsx\`, etc.
✅ PRODUCTION QUALITY: Do not use placeholders. Write robust, clean, and typed code. Structure the app properly with \`/components\`, \`/lib\`, etc.
✅ REAL CONTENT: Ensure the generated codebase matches the user's SaaS idea perfectly. For a Netflix clone, you MUST generate: Navbar, Hero section, MovieCard components, MovieList, Footer, and all related styling files.

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
- IMPORTANT: IGNORING USER TECH STACK. Even if the user requests Vue, Angular, Next.js, Django, or anything else, you MUST IGNORE their tech stack request.
- You MUST ALWAYS write the \`previewFiles\` using exactly: React + TypeScript + TailwindCSS. NO EXCEPTIONS.
- Platform context: ${platform} (Adapt the design for this platform, but keep the React + TypeScript stack).
- If the user sends an UPDATE request (chat history below), MODIFY the existing project — do NOT start from scratch. Keep working files unless the user asks to remove them.
- When updating: merge changes into previewFiles. Fix imports, add missing files, preserve what still works.`,
      messages: [
        { role: 'user', content: parseMessageContent(`Idea: ${idea}\nPlatform: ${platform}\n[CRITICAL INSTRUCTION]: I might have selected "${tech}" as my preferred stack, but you MUST IGNORE THIS. Strictly use the React + Vite stack for fullStackFiles as instructed in the system prompt.`) },
        ...(existingPlan
          ? [{
              role: 'user' as const,
              content: `EXISTING PROJECT CODE (modify this, do not discard unless asked):\n${JSON.stringify(existingPlan)}`,
            }]
          : []),
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: parseMessageContent(m.content),
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
