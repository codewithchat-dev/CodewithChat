import { z } from 'zod'

export const planSchema = z.object({
  overview: z.string().describe('A brief 2-sentence summary of what we are building.'),
  steps: z.array(z.object({
    title: z.string().describe('e.g., Step 1: Initialize Next.js Project'),
    description: z.string().describe('Clear instructions on what to do.'),
    codeSnippet: z.string().optional().describe('Actual code to copy/paste, or terminal command.'),
    isCommand: z.boolean().describe('True if the codeSnippet is a terminal command, false if it is file code.'),
    fileTarget: z.string().optional().describe('If isCommand is false, specify the file path (e.g., app/page.tsx).'),
    link: z.object({
      text: z.string(),
      url: z.string()
    }).optional().describe('An external link if they need to grab an API key or read docs (e.g., Stripe Dashboard).')
  })),
  previewFiles: z.array(z.object({
    path: z.string(),
    content: z.string()
  })).optional().describe('DEPRECATED: Leave this array empty. All files should go into fullStackFiles.'),
  fullStackFiles: z.array(z.object({
    path: z.string(),
    content: z.string()
  })).optional().describe('CRITICAL: Generate a complete Next.js (App Router) + Supabase + Vercel AI SDK project here. The user will download these files as a ZIP to deploy to production. You MUST include: /package.json, /app/layout.tsx, /app/page.tsx, /lib/supabase.ts (or equivalent), and Next.js configuration files. This is separate from previewFiles. Do not output just placeholders; write robust, production-ready code for the requested app idea.'),
  dependencies: z.record(z.string(), z.string()).describe('CRITICAL AND MANDATORY: Required npm packages. If your code imports ANY external package (e.g., canvas-confetti, recharts, framer-motion), you MUST explicitly list it here (e.g. { "canvas-confetti": "latest" }). Failure to do so will CRASH the preview with a red screen of death!')
})
