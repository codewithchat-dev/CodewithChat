// Canonical stack used by every CodewithChat generated project
export const DEFAULT_TECH_STACK =
  'React + Vite + TypeScript + Tailwind'

export const DEFAULT_PLATFORM = 'Website'

export const DEFAULT_AGENT = 'Gemini 2.5 Flash'

/**
 * New CodewithChat projects always use Vite.
 */
export function isViteStack(_tech?: string): boolean {
  return true
}

/**
 * Legacy helper.
 *
 * Kept temporarily so old imports don't break.
 * New generated projects should never use Next.js.
 */
export function isNextJsStack(tech: string): boolean {
  return /next/i.test(tech)
}

/**
 * Legacy helper.
 *
 * Kept temporarily so old imports don't break.
 * New generated projects should never use plain HTML as their main stack.
 */
export function isVanillaStack(tech: string): boolean {
  return /html/i.test(tech)
}

/**
 * Returns the canonical stack regardless of an old/user-selected value.
 */
export function getCanonicalTechStack(): string {
  return DEFAULT_TECH_STACK
}

/**
 * Detect whether a generated project contains the minimum
 * required Vite application files.
 */
export function hasValidViteStructure(
  files: Record<string, string>,
): boolean {
  return Boolean(
    files['/package.json'] &&
      files['/index.html'] &&
      (files['/vite.config.ts'] || files['/vite.config.js']) &&
      (files['/src/main.tsx'] || files['/src/main.jsx']) &&
      (files['/src/App.tsx'] || files['/src/App.jsx']),
  )
}

/**
 * Detect whether the project has Supabase integration.
 */
export function hasSupabaseIntegration(
  files: Record<string, string>,
): boolean {
  return Boolean(
    files['/src/lib/supabase.ts'] ||
      files['/src/lib/supabase.js'] ||
      Object.keys(files).some(path =>
        path.startsWith('/supabase/'),
      ),
  )
}

/**
 * These files should exist in every generated CodewithChat project.
 */
export const REQUIRED_PROJECT_FILES = [
  '/package.json',
  '/.gitignore',
  '/index.html',
  '/vite.config.ts',
  '/tsconfig.json',
  '/tsconfig.app.json',
  '/tailwind.config.js',
  '/postcss.config.js',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
] as const

/**
 * Additional files commonly expected when Supabase is used.
 */
export const SUPABASE_PROJECT_FILES = [
  '/.env.example',
  '/src/lib/supabase.ts',
  '/supabase/config.toml',
] as const

/**
 * Find important missing files from a generated project.
 */
export function getMissingProjectFiles(
  files: Record<string, string>,
): string[] {
  return REQUIRED_PROJECT_FILES.filter(
    path => !files[path],
  )
}