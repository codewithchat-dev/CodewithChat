import { z } from 'zod'

const projectFileSchema = z.object({
  path: z
    .string()
    .describe(
      'Absolute project file path starting with /. Example: /src/App.tsx',
    ),

  content: z
    .string()
    .describe(
      'Complete contents of the file. CRITICAL: DO NOT minify or squash code onto a single line. ALWAYS use proper line breaks, indentation, and formatting.',
    ),
})

export const planSchema = z.object({
  // ─────────────────────────────────────────────
  // SHORT PROJECT SUMMARY
  // ─────────────────────────────────────────────

  overview: z
    .string()
    .describe(
      'A maximum 2-sentence summary of what was built. Keep this short because source code generation is the priority.',
    ),

  // ─────────────────────────────────────────────
  // SHORT GUIDE
  // Keep temporarily because ProjectGuide and
  // BuildActivityFeed currently depend on it.
  // ─────────────────────────────────────────────

  steps: z.array(
    z.object({
      title: z
        .string()
        .describe(
          'Short build/setup step title. Example: Configure Supabase authentication.',
        ),

      description: z
        .string()
        .describe(
          'Short practical explanation of this setup step.',
        ),

      codeSnippet: z
        .string()
        .optional()
        .describe(
          'Optional short command or small configuration snippet. Never duplicate complete project source files here.',
        ),

      isCommand: z
        .boolean()
        .describe(
          'True when codeSnippet is a terminal command. False when it is a small file/config example.',
        ),

      fileTarget: z
        .string()
        .optional()
        .describe(
          'Optional target file path. Example: /src/lib/supabase.ts or /.env.example.',
        ),

      link: z
        .object({
          text: z.string(),
          url: z.string(),
        })
        .optional()
        .describe(
          'Optional useful external setup/documentation link.',
        ),
    }),
  )
    .describe(
      'Keep the setup guide concise, ideally no more than 3 short steps. Project files are more important than guide text.',
    ),

  // ─────────────────────────────────────────────
  // REAL PROJECT SOURCE
  // Legacy name: previewFiles
  // ─────────────────────────────────────────────

  previewFiles: z
    .array(projectFileSchema)
    .describe(
      `The COMPLETE real project source code.

This is not a temporary mock preview.

Generate a professional React + Vite + TypeScript project.

Every project should include the required files such as:

/package.json
/.gitignore
/index.html
/vite.config.ts
/tsconfig.json
/tsconfig.app.json
/tailwind.config.js
/postcss.config.js

/src/main.tsx
/src/App.tsx
/src/index.css

And all required components, pages, hooks, utilities, services, types, and data files.

DEFAULT: frontend-only with mock data in /src/data/. Every project must look premium — custom brand theme in tailwind.config.js, Tailwind CSS animations, Unsplash images on every visual (no blanks), SafeImage fallback component, full structure (navbar, sections/pages, footer). Works smoothly with local React state.

STRICTLY FRONTEND ONLY: Do NOT add Supabase, auth, login, or any backend code, even if asked. We are building frontend mockups only.

Every locally imported file MUST exist.

Do not generate placeholder-only files.

The project should be usable for preview, ZIP download, VS Code, GitHub export, and deployment.`,
    ),

  // ─────────────────────────────────────────────
  // LEGACY FIELD
  // Keep temporarily so existing app code doesn't
  // break. AI must leave it empty.
  // ─────────────────────────────────────────────

  fullStackFiles: z
    .array(projectFileSchema)
    .optional()
    .describe(
      'DEPRECATED. Always leave this empty. All frontend, backend integration, Supabase, configuration, and project files belong in previewFiles.',
    ),

  // ─────────────────────────────────────────────
  // PREVIEW RUNTIME DEPENDENCIES
  // ─────────────────────────────────────────────

  dependencies: z
    .record(
      z.string(),
      z.string(),
    )
    .describe(
      `Runtime npm packages imported by the generated source code.

Examples:
{
  "lucide-react": "^0.468.0",
  "react-router-dom": "^7.0.0"
}

Only include packages actually imported at runtime.

Do NOT include build tools here such as:
vite
typescript
tailwindcss
postcss
autoprefixer
@vitejs/plugin-react

Those belong inside the generated /package.json.`,
    ),
})

export type Plan = z.infer<typeof planSchema>

export type ProjectFile = z.infer<typeof projectFileSchema>