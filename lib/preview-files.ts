export interface ProjectFileInput {
  path?: string
  content?: string
}

export interface PreviewValidationIssue {
  file: string
  message: string
}

const CODE_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.jsx',
  '.js',
  '.css',
  '.json',
]

/**
 * These brand/social icons should not be imported
 * directly from lucide-react.
 */
const INVALID_LUCIDE_ICONS = new Set([
  'Facebook',
  'Twitter',
  'Instagram',
  'Youtube',
  'Linkedin',
  'Twitch',
  'Discord',
  'Slack',
  'Tiktok',
  'Snapchat',
  'Pinterest',
  'Whatsapp',
])

/**
 * Build/dev dependencies that should not be installed
 * inside the Sandpack browser runtime.
 */
const BLOCKED_RUNTIME_DEPENDENCIES = new Set([
  'next',
  'vite',
  '@vitejs/plugin-react',
  'typescript',
  'tailwindcss',
  'postcss',
  'autoprefixer',
  '@vercel/ai',
  '@supabase/ssr',
  '@supabase/auth-helpers-nextjs',
])

// ─────────────────────────────────────────────────────────────
// PATH HELPERS
// ─────────────────────────────────────────────────────────────

export function normalizePreviewPath(
  path: string,
  _useTypeScript = true,
): string {
  const trimmed = path.trim()

  if (!trimmed) {
    return '/'
  }

  const normalized = trimmed
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')

  return normalized.startsWith('/')
    ? normalized
    : `/${normalized}`
}

function dirname(path: string): string {
  const normalized = normalizePreviewPath(path)
  const index = normalized.lastIndexOf('/')

  if (index <= 0) {
    return '/'
  }

  return normalized.slice(0, index)
}

function relativePath(
  fromFile: string,
  targetPath: string,
): string {
  const fromParts = dirname(fromFile)
    .split('/')
    .filter(Boolean)

  const targetParts = normalizePreviewPath(targetPath)
    .split('/')
    .filter(Boolean)

  let common = 0

  while (
    common < fromParts.length &&
    common < targetParts.length &&
    fromParts[common] === targetParts[common]
  ) {
    common += 1
  }

  const upCount =
    fromParts.length - common

  const result = [
    ...Array(upCount).fill('..'),
    ...targetParts.slice(common),
  ].join('/')

  if (!result) {
    return './'
  }

  if (
    result.startsWith('.') ||
    result.startsWith('/')
  ) {
    return result
  }

  return `./${result}`
}

// ─────────────────────────────────────────────────────────────
// PROJECT FILE MAP
// ─────────────────────────────────────────────────────────────

/**
 * Converts generated previewFiles into the canonical
 * real project structure.
 *
 * Example:
 *
 * /package.json
 * /vite.config.ts
 * /src/main.tsx
 * /src/App.tsx
 * /src/components/*
 * /supabase/*
 */
export function buildPreviewFiles(
  previewFiles:
    | Array<ProjectFileInput | null | undefined>
    | undefined,

  useTypeScript = true,
): Record<string, string> {
  const result: Record<string, string> = {}

  if (!previewFiles?.length) {
    return result
  }

  for (const file of previewFiles) {
    if (
      !file?.path ||
      typeof file.content !== 'string'
    ) {
      continue
    }

    const path = normalizePreviewPath(
      file.path,
      useTypeScript,
    )

    result[path] = file.content
  }

  return result
}

// ─────────────────────────────────────────────────────────────
// DEPENDENCY DISCOVERY
// ─────────────────────────────────────────────────────────────

/**
 * Converts an import source into its npm package name.
 *
 * Examples:
 *
 * react-router-dom -> react-router-dom
 * react-router-dom/server -> react-router-dom
 *
 * @supabase/supabase-js -> @supabase/supabase-js
 * @supabase/supabase-js/foo -> @supabase/supabase-js
 *
 * ./Navbar -> null
 * @/components/Navbar -> null
 */
function getPackageNameFromImport(
  source: string,
): string | null {
  if (
    source.startsWith('.') ||
    source.startsWith('/') ||
    source.startsWith('@/') ||
    source.startsWith('http://') ||
    source.startsWith('https://')
  ) {
    return null
  }

  if (source.startsWith('@')) {
    const parts = source.split('/')

    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`
    }

    return source
  }

  return source.split('/')[0] || null
}

/**
 * Used only if the generated package.json forgot
 * to include a package that the source imports.
 */
function getFallbackRuntimeVersion(
  packageName: string,
): string {
  switch (packageName) {
    case 'react':
      return '^18.2.0'

    case 'react-dom':
      return '^18.2.0'

    case 'react-router-dom':
      return '^6.28.0'

    case 'lucide-react':
      return '^0.468.0'

    case 'clsx':
      return '^2.1.1'

    case 'tailwind-merge':
      return '^2.5.4'

    case '@supabase/supabase-js':
      return '^2.45.0'

    case 'framer-motion':
      return '^11.0.0'

    case 'date-fns':
      return '^4.0.0'

    case 'recharts':
      return '^2.13.0'

    default:
      return 'latest'
  }
}

/**
 * Scans generated TS/JS source files and detects
 * external npm imports automatically.
 *
 * This means even if AI forgets:
 *
 * "react-router-dom": "..."
 *
 * in package.json, preview can still run.
 */
function discoverRuntimeDependencies(
  previewFiles:
    | Array<ProjectFileInput | null | undefined>
    | undefined,
): Record<string, string> {
  const discovered: Record<string, string> = {}

  for (const file of previewFiles ?? []) {
    if (
      !file?.path ||
      typeof file.content !== 'string'
    ) {
      continue
    }

    const path =
      normalizePreviewPath(file.path)

    if (!/\.(tsx?|jsx?)$/.test(path)) {
      continue
    }

    const sources = new Set<string>()

    /**
     * Handles:
     *
     * import X from 'foo'
     * import { X } from 'foo'
     * export { X } from 'foo'
     */
    const fromRegex =
      /\b(?:import|export)\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g

    /**
     * Handles:
     *
     * import 'foo'
     */
    const sideEffectRegex =
      /\bimport\s+['"]([^'"]+)['"]/g

    /**
     * Handles:
     *
     * import('foo')
     */
    const dynamicImportRegex =
      /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g

    let match: RegExpExecArray | null

    while (
      (match =
        fromRegex.exec(file.content)) !== null
    ) {
      if (match[1]) {
        sources.add(match[1])
      }
    }

    while (
      (match =
        sideEffectRegex.exec(file.content)) !== null
    ) {
      if (match[1]) {
        sources.add(match[1])
      }
    }

    while (
      (match =
        dynamicImportRegex.exec(file.content)) !== null
    ) {
      if (match[1]) {
        sources.add(match[1])
      }
    }

    for (const source of sources) {
      const packageName =
        getPackageNameFromImport(source)

      if (!packageName) {
        continue
      }

      if (
        BLOCKED_RUNTIME_DEPENDENCIES.has(
          packageName,
        )
      ) {
        continue
      }

      discovered[packageName] =
        getFallbackRuntimeVersion(
          packageName,
        )
    }
  }

  return discovered
}

/**
 * Gets ALL packages required by the preview.
 *
 * Priority:
 *
 * import scanner
 * ↓
 * generated package.json
 * ↓
 * explicit plan.dependencies
 *
 * Explicit dependency values win.
 */
export function getProjectRuntimeDependencies(
  previewFiles:
    | Array<ProjectFileInput | null | undefined>
    | undefined,

  explicitDependencies: Record<string, string> = {},
): Record<string, string> {
  const packageFile =
    previewFiles?.find(file => {
      if (!file?.path) {
        return false
      }

      return (
        normalizePreviewPath(file.path) ===
        '/package.json'
      )
    })

  let packageDependencies: Record<string, string> = {}

  // ─── PACKAGE.JSON ─────────────────────────────────────

  if (packageFile?.content) {
    try {
      const packageJson = JSON.parse(
        packageFile.content,
      ) as {
        dependencies?: unknown
      }

      if (
        packageJson.dependencies &&
        typeof packageJson.dependencies === 'object' &&
        !Array.isArray(packageJson.dependencies)
      ) {
        packageDependencies =
          Object.fromEntries(
            Object.entries(
              packageJson.dependencies,
            ).filter(
              (
                entry,
              ): entry is [string, string] =>
                typeof entry[1] === 'string',
            ),
          )
      }
    } catch (error) {
      console.error(
        '[Preview] Failed to parse generated package.json:',
        error,
      )
    }
  }

  // ─── IMPORT SCANNER ───────────────────────────────────

  const discoveredDependencies =
    discoverRuntimeDependencies(
      previewFiles,
    )

  // ─── MERGE ────────────────────────────────────────────

  const merged = {
    ...discoveredDependencies,
    ...packageDependencies,
    ...explicitDependencies,
  }

  return Object.fromEntries(
    Object.entries(merged).filter(
      ([name]) =>
        !BLOCKED_RUNTIME_DEPENDENCIES.has(
          name,
        ),
    ),
  )
}

// ─────────────────────────────────────────────────────────────
// PROJECT DETECTION
// ─────────────────────────────────────────────────────────────

export function hasPreviewEntry(
  files: Record<string, string>,
): boolean {
  return Boolean(
    // Canonical Vite
    files['/src/main.tsx'] ||
      files['/src/main.jsx'] ||
      files['/src/main.ts'] ||
      files['/src/main.js'] ||

      // Sandpack runtime
      files['/index.tsx'] ||
      files['/index.jsx'] ||
      files['/App.tsx'] ||
      files['/App.jsx'] ||

      // Legacy
      files['/app/page.tsx'] ||
      files['/app/page.jsx'],
  )
}

export function isViteProject(
  files: Record<string, string>,
): boolean {
  return Boolean(
    files['/vite.config.ts'] ||
      files['/vite.config.js'] ||
      files['/src/main.tsx'] ||
      files['/src/main.jsx'] ||
      files['/src/App.tsx'] ||
      files['/src/App.jsx'],
  )
}

// ─────────────────────────────────────────────────────────────
// IMPORT ALIAS REWRITE
// ─────────────────────────────────────────────────────────────

/**
 * Converts:
 *
 * @/components/Navbar
 *
 * into a relative path suitable for the flattened
 * Sandpack runtime.
 */
function rewriteSrcAliases(
  content: string,
  sourceFile: string,
): string {
  return content.replace(
    /(['"])@\/([^'"]+)\1/g,
    (
      _match,
      quote: string,
      aliasPath: string,
    ) => {
      const canonicalTarget =
        `/src/${aliasPath}`

      const previewSource =
        sourceFile.startsWith('/src/')
          ? sourceFile.slice(4)
          : sourceFile

      const previewTarget =
        canonicalTarget.startsWith('/src/')
          ? canonicalTarget.slice(4)
          : canonicalTarget

      const relative =
        relativePath(
          previewSource,
          previewTarget,
        )

      return `${quote}${relative}${quote}`
    },
  )
}

// ─────────────────────────────────────────────────────────────
// SANDPACK SOURCE TRANSFORM
// ─────────────────────────────────────────────────────────────

/**
 * Only changes the PREVIEW COPY.
 *
 * The source stored in the database and downloaded ZIP
 * remains unchanged.
 */
export function transformForSandpack(
  content: string,
  filePath: string,
): string {
  let code = content

  // Remove framework directives not needed in Vite preview.
  code = code
    .replace(
      /^\s*['"]use client['"];?\s*$/gm,
      '',
    )
    .replace(
      /^\s*['"]use server['"];?\s*$/gm,
      '',
    )

  // Convert @/... imports.
  code = rewriteSrcAliases(
    code,
    filePath,
  )

  /**
   * Preview-only Supabase values.
   *
   * Prevents createClient() from crashing immediately
   * before the user connects their own Supabase project.
   *
   * These are NOT written to the real project.
   */
  code = code
    .replace(
      /import\.meta\.env\.VITE_SUPABASE_URL/g,
      JSON.stringify(
        'https://preview.supabase.co',
      ),
    )
    .replace(
      /import\.meta\.env\.VITE_SUPABASE_PUBLISHABLE_KEY/g,
      JSON.stringify(
        'preview-public-key',
      ),
    )
    .replace(
      /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g,
      JSON.stringify(
        'preview-anon-key',
      ),
    )

  return code
}

// ─────────────────────────────────────────────────────────────
// VITE → SANDPACK RUNTIME
// ─────────────────────────────────────────────────────────────

/**
 * Real project:
 *
 * /src/App.tsx
 * /src/components/Navbar.tsx
 *
 * Sandpack runtime:
 *
 * /App.tsx
 * /components/Navbar.tsx
 *
 * Only the preview representation is flattened.
 */
export function extractPreviewFromVite(
  projectFiles: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = {}

  for (
    const [rawPath, rawContent]
    of Object.entries(projectFiles)
  ) {
    const path =
      normalizePreviewPath(rawPath)

    if (!path.startsWith('/src/')) {
      continue
    }

    /**
     * We generate a custom Sandpack entry below,
     * so the Vite main entry isn't copied.
     */
    if (
      path === '/src/main.tsx' ||
      path === '/src/main.jsx' ||
      path === '/src/main.ts' ||
      path === '/src/main.js'
    ) {
      continue
    }

    // /src/App.tsx -> /App.tsx
    const previewPath =
      path.slice('/src'.length)

    let content = rawContent

    // ─── CSS ────────────────────────────────────────────

    if (path.endsWith('.css')) {
      /**
       * Tailwind utilities are currently supplied through
       * the external Tailwind preview runtime.
       *
       * Keep custom CSS.
       */
      content = content
        .replace(
          /@tailwind\s+(base|components|utilities)\s*;?/g,
          '',
        )
        .trim()
    }

    // ─── TS / JS ────────────────────────────────────────

    else if (
      /\.(tsx?|jsx?)$/.test(path)
    ) {
      content =
        transformForSandpack(
          content,
          path,
        )
    }

    result[previewPath] =
      content
  }

  const hasTsApp =
    Boolean(result['/App.tsx'])

  const hasJsApp =
    Boolean(
      result['/App.jsx'] ||
        result['/App.js'],
    )

  const hasCss =
    Boolean(result['/index.css'])

  const cssImport =
    hasCss
      ? `import './index.css'`
      : ''

  // ───────────────────────────────────────────────────────
  // TYPESCRIPT ENTRY
  // ───────────────────────────────────────────────────────

  if (hasTsApp) {
    result['/index.tsx'] = `
import React from 'react'
import { createRoot } from 'react-dom/client'
${cssImport}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

const root = createRoot(rootElement)

async function startPreview() {
  try {
    const appModule = await import('./App')

    if (!appModule.default) {
      throw new Error(
        'App.tsx does not provide a default export.',
      )
    }

    const App = appModule.default

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error(
      '[Preview Runtime Error]',
      error,
    )

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    root.render(
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: '#fafafa',
          padding: '32px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          Preview runtime error
        </h2>

        <p
          style={{
            margin: '0 0 16px',
            color: '#a1a1aa',
            fontSize: '13px',
          }}
        >
          The generated project loaded, but one of its runtime modules failed.
        </p>

        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#fca5a5',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          {message}
        </pre>
      </div>,
    )
  }
}

startPreview()
`.trim()
  }

  // ───────────────────────────────────────────────────────
  // JAVASCRIPT ENTRY
  // ───────────────────────────────────────────────────────

  else if (hasJsApp) {
    result['/index.jsx'] = `
import React from 'react'
import { createRoot } from 'react-dom/client'
${cssImport}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

const root = createRoot(rootElement)

async function startPreview() {
  try {
    const appModule = await import('./App')

    if (!appModule.default) {
      throw new Error(
        'App.jsx does not provide a default export.',
      )
    }

    const App = appModule.default

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error(
      '[Preview Runtime Error]',
      error,
    )

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    root.render(
      <div
        style={{
          minHeight: '100vh',
          background: '#09090b',
          color: '#fafafa',
          padding: '32px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h2
          style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: 700,
          }}
        >
          Preview runtime error
        </h2>

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: '#fca5a5',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          {message}
        </pre>
      </div>,
    )
  }
}

startPreview()
`.trim()
  }

  return result
}

// ─────────────────────────────────────────────────────────────
// LEGACY PROJECT SUPPORT
// ─────────────────────────────────────────────────────────────

/**
 * Temporary support for projects generated with the
 * old fullStackFiles architecture.
 */
export function extractPreviewFromFullStack(
  fullStackFiles: Record<string, string>,
): Record<string, string> {
  if (
    Object.keys(fullStackFiles).length === 0
  ) {
    return {}
  }

  if (isViteProject(fullStackFiles)) {
    return extractPreviewFromVite(
      fullStackFiles,
    )
  }

  const result: Record<string, string> = {}

  const legacyPage =
    fullStackFiles['/app/page.tsx'] ??
    fullStackFiles['app/page.tsx'] ??
    fullStackFiles['/page.tsx'] ??
    fullStackFiles['page.tsx'] ??
    fullStackFiles['/App.tsx'] ??
    fullStackFiles['App.tsx']

  if (legacyPage) {
    result['/App.tsx'] =
      transformForSandpack(
        legacyPage,
        '/App.tsx',
      )
  }

  const legacyPrefixes = [
    '/components/',
    '/hooks/',
    '/lib/',
    '/types/',
    '/utils/',
    '/data/',
    '/context/',
    '/pages/',
  ]

  for (
    const [rawPath, content]
    of Object.entries(fullStackFiles)
  ) {
    const path =
      normalizePreviewPath(rawPath)

    if (
      !legacyPrefixes.some(
        prefix =>
          path.startsWith(prefix),
      )
    ) {
      continue
    }

    result[path] =
      transformForSandpack(
        content,
        path,
      )
  }

  if (
    result['/App.tsx'] &&
    !result['/index.tsx']
  ) {
    result['/index.tsx'] = `
import React from 'react'
import { createRoot } from 'react-dom/client'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element was not found')
}

const root = createRoot(rootElement)

async function startPreview() {
  try {
    const appModule = await import('./App')
    const App = appModule.default

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error(
      '[Preview Runtime Error]',
      error,
    )

    const message =
      error instanceof Error
        ? error.message
        : String(error)

    root.render(
      <div
        style={{
          minHeight: '100vh',
          padding: '32px',
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <h2>Preview runtime error</h2>

        <pre
          style={{
            color: '#fca5a5',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </pre>
      </div>,
    )
  }
}

startPreview()
`.trim()
  }

  return result
}

// ─────────────────────────────────────────────────────────────
// MAIN PREVIEW BUILDER
// ─────────────────────────────────────────────────────────────

/**
 * New architecture:
 *
 * previewFiles = complete real project
 *
 * fullStackFiles = legacy fallback only
 */
export function buildInstantPreviewFiles(
  previewFiles:
    | Array<ProjectFileInput | null | undefined>
    | undefined,

  fullStackFiles: Record<string, string> = {},

  useTypeScript = true,
): Record<string, string> {
  const project =
    buildPreviewFiles(
      previewFiles,
      useTypeScript,
    )

  // ─── NEW PROJECT ──────────────────────────────────────

  if (hasPreviewEntry(project)) {
    if (isViteProject(project)) {
      return extractPreviewFromVite(
        project,
      )
    }

    return project
  }

  // ─── LEGACY PROJECT ───────────────────────────────────

  const legacy =
    extractPreviewFromFullStack(
      fullStackFiles,
    )

  if (hasPreviewEntry(legacy)) {
    return legacy
  }

  return {}
}

// ─────────────────────────────────────────────────────────────
// IMPORT RESOLUTION
// ─────────────────────────────────────────────────────────────

function resolveImportBasePath(
  fromFile: string,
  importPath: string,
): string | null {
  if (importPath.startsWith('@/')) {
    return `/src/${importPath.slice(2)}`
  }

  if (!importPath.startsWith('.')) {
    return null
  }

  const fromDir =
    dirname(fromFile)

  const parts =
    fromDir
      .split('/')
      .filter(Boolean)

  for (
    const segment of importPath.split('/')
  ) {
    if (
      !segment ||
      segment === '.'
    ) {
      continue
    }

    if (segment === '..') {
      parts.pop()
      continue
    }

    parts.push(segment)
  }

  return `/${parts.join('/')}`
}

function resolveRelativeImport(
  files: Record<string, string>,
  fromFile: string,
  importPath: string,
): string | null {
  const basePath =
    resolveImportBasePath(
      fromFile,
      importPath,
    )

  if (!basePath) {
    return null
  }

  if (
    Object.prototype.hasOwnProperty.call(
      files,
      basePath,
    )
  ) {
    return basePath
  }

  for (
    const extension
    of CODE_EXTENSIONS
  ) {
    const candidate =
      `${basePath}${extension}`

    if (
      Object.prototype.hasOwnProperty.call(
        files,
        candidate,
      )
    ) {
      return candidate
    }
  }

  for (
    const extension
    of CODE_EXTENSIONS
  ) {
    const candidate =
      `${basePath}/index${extension}`

    if (
      Object.prototype.hasOwnProperty.call(
        files,
        candidate,
      )
    ) {
      return candidate
    }
  }

  return null
}

// ─────────────────────────────────────────────────────────────
// IMPORT PARSER
// ─────────────────────────────────────────────────────────────

interface ParsedImport {
  source: string
  defaultImport?: string
  namedImports: string[]
}

function parseImports(
  content: string,
): ParsedImport[] {
  const imports: ParsedImport[] = []

  const importRegex =
    /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g

  let match: RegExpExecArray | null

  while (
    (match =
      importRegex.exec(content)) !== null
  ) {
    const clause =
      match[1]?.trim() ?? ''

    const source =
      match[2]?.trim() ?? ''

    if (!source) {
      continue
    }

    let defaultImport:
      | string
      | undefined

    const namedImports: string[] = []

    if (clause.startsWith('{')) {
      const names =
        clause
          .replace(/^{|}$/g, '')
          .split(',')

      for (const name of names) {
        const cleaned =
          name
            .trim()
            .split(/\s+as\s+/)[0]
            ?.trim()

        if (cleaned) {
          namedImports.push(
            cleaned,
          )
        }
      }
    }

    else if (
      clause.includes('{')
    ) {
      const openBrace =
        clause.indexOf('{')

      const defaultPart =
        clause
          .slice(
            0,
            openBrace,
          )
          .replace(/,/g, '')
          .trim()

      defaultImport =
        defaultPart ||
        undefined

      const namedPart =
        clause.slice(
          openBrace + 1,
        )

      for (
        const name
        of namedPart
          .replace(/}/g, '')
          .split(',')
      ) {
        const cleaned =
          name
            .trim()
            .split(/\s+as\s+/)[0]
            ?.trim()

        if (cleaned) {
          namedImports.push(
            cleaned,
          )
        }
      }
    }

    else if (
      !clause.startsWith('*')
    ) {
      defaultImport =
        clause
          .replace(/,/g, '')
          .trim() ||
        undefined
    }

    imports.push({
      source,
      defaultImport,
      namedImports,
    })
  }

  return imports
}

function hasDefaultExport(
  content: string,
): boolean {
  return /export\s+default\b/.test(
    content,
  )
}

function escapeRegex(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&',
  )
}

function hasNamedExport(
  content: string,
  name: string,
): boolean {
  const safeName =
    escapeRegex(name)

  return Boolean(
    new RegExp(
      `export\\s+(?:async\\s+)?(?:function|const|let|var|class|type|interface|enum)\\s+${safeName}\\b`,
    ).test(content) ||

      new RegExp(
        `export\\s*\\{[^}]*\\b${safeName}\\b[^}]*\\}`,
      ).test(content),
  )
}

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

export function validatePreviewFiles(
  files: Record<string, string>,
): PreviewValidationIssue[] {
  const issues:
    PreviewValidationIssue[] = []

  // ─── ENTRY ────────────────────────────────────────────

  if (
    !files['/src/main.tsx'] &&
    !files['/src/main.jsx'] &&
    !files['/index.tsx'] &&
    !files['/index.jsx']
  ) {
    issues.push({
      file: '/src/main.tsx',

      message:
        'Missing application entry point.',
    })
  }

  // ─── APP ──────────────────────────────────────────────

  if (
    !files['/src/App.tsx'] &&
    !files['/src/App.jsx'] &&
    !files['/App.tsx'] &&
    !files['/App.jsx']
  ) {
    issues.push({
      file: '/src/App.tsx',

      message:
        'Missing main App component.',
    })
  }

  // ─── IMPORTS ──────────────────────────────────────────

  for (
    const [filePath, content]
    of Object.entries(files)
  ) {
    if (
      !/\.(tsx?|jsx?)$/.test(
        filePath,
      )
    ) {
      continue
    }

    for (
      const imported
      of parseImports(content)
    ) {
      // ─── LUCIDE ───────────────────────────────────────

      if (
        imported.source ===
        'lucide-react'
      ) {
        for (
          const icon
          of imported.namedImports
        ) {
          if (
            INVALID_LUCIDE_ICONS.has(
              icon,
            )
          ) {
            issues.push({
              file: filePath,

              message:
                `"${icon}" is not available in lucide-react. ` +
                'Use another Lucide icon, text, or inline SVG.',
            })
          }
        }

        continue
      }

      // ─── LOCAL IMPORT ─────────────────────────────────

      const isLocal =
        imported.source.startsWith('.') ||
        imported.source.startsWith('@/')

      if (!isLocal) {
        continue
      }

      const resolved =
        resolveRelativeImport(
          files,
          filePath,
          imported.source,
        )

      if (!resolved) {
        issues.push({
          file: filePath,

          message:
            `Missing local import "${imported.source}". ` +
            'Generate the corresponding project file.',
        })

        continue
      }

      const target =
        files[resolved]

      if (!target) {
        continue
      }

      // ─── DEFAULT EXPORT ────────────────────────────────

      if (
        imported.defaultImport &&
        !hasDefaultExport(target)
      ) {
        issues.push({
          file: filePath,

          message:
            `"${imported.defaultImport}" is imported as default from ` +
            `"${imported.source}", but ${resolved} has no default export.`,
        })
      }

      // ─── NAMED EXPORT ──────────────────────────────────

      for (
        const name
        of imported.namedImports
      ) {
        if (
          !hasNamedExport(
            target,
            name,
          )
        ) {
          issues.push({
            file: filePath,

            message:
              `Named import "{ ${name} }" from "${imported.source}" ` +
              `does not match an export in ${resolved}.`,
          })
        }
      }
    }
  }

  return issues
}

// ─────────────────────────────────────────────────────────────
// AI FIX MESSAGE
// ─────────────────────────────────────────────────────────────

export function formatPreviewIssuesForAI(
  issues:
    PreviewValidationIssue[],
): string {
  if (!issues.length) {
    return ''
  }

  const summary =
    issues
      .slice(0, 12)
      .map(
        issue =>
          `- ${issue.file}: ${issue.message}`,
      )
      .join('\n')

  return `Fix the generated project errors.

${summary}

Rules:
- Keep the canonical React + Vite + TypeScript project structure.
- Every local import must point to a real file.
- Every external runtime import must exist in package.json dependencies.
- Do not create fake placeholder components.
- Fix default vs named exports correctly.
- Keep /src/main.tsx and /src/App.tsx.
- Keep package.json consistent with actual imports.
- Never import Facebook, Twitter, Instagram, Youtube, Discord, Linkedin or other brand icons from lucide-react.
- Return the complete corrected project.`
}

// ─────────────────────────────────────────────────────────────
// LEGACY REPAIR API
// ─────────────────────────────────────────────────────────────

/**
 * Kept temporarily so existing imports don't break.
 *
 * Fake missing files are intentionally NOT generated.
 */
export function repairPreviewFiles(
  files: Record<string, string>,
): {
  files: Record<string, string>
  repairedPaths: string[]
} {
  return {
    files: {
      ...files,
    },

    repairedPaths: [],
  }
}