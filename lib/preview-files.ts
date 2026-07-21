const ENTRY_ALIASES = new Set([
  '/app/page.tsx',
  '/app/page.js',
  '/page.tsx',
  '/page.js',
  '/src/app.tsx',
  '/src/app.jsx',
])

export function normalizePreviewPath(path: string, useTypeScript = true): string {
  const filePath = path.startsWith('/') ? path : `/${path}`
  if (ENTRY_ALIASES.has(filePath.toLowerCase())) {
    return useTypeScript ? '/App.tsx' : '/App.js'
  }
  return filePath
}

export function buildPreviewFiles(
  previewFiles: Array<{ path?: string; content?: string } | null | undefined> | undefined,
  useTypeScript = true,
): Record<string, string> {
  const filesObj: Record<string, string> = {}
  if (!previewFiles?.length) return filesObj

  for (const file of previewFiles) {
    if (!file?.path || !file?.content) continue
    const normalizedPath = normalizePreviewPath(file.path, useTypeScript)
    filesObj[normalizedPath] = file.content
  }

  return filesObj
}

export function hasPreviewEntry(files: Record<string, string>): boolean {
  return Boolean(files['/App.tsx'] || files['/App.js'] || files['/index.html'] || files['index.html'])
}

export interface PreviewValidationIssue {
  file: string
  message: string
}

// Brand/social icons removed from lucide-react — importing them yields `undefined` at runtime.
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

const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']

function resolveImportBasePath(fromFile: string, importPath: string): string | null {
  if (!importPath.startsWith('.')) return null

  const fromDir = fromFile.includes('/')
    ? fromFile.slice(0, fromFile.lastIndexOf('/'))
    : ''

  const segments = importPath.split('/')
  const resolvedParts: string[] = fromDir ? fromDir.split('/').filter(Boolean) : []

  for (const segment of segments) {
    if (segment === '.') continue
    if (segment === '..') {
      resolvedParts.pop()
      continue
    }
    resolvedParts.push(segment)
  }

  return `/${resolvedParts.join('/')}`
}

function resolveRelativeImport(
  files: Record<string, string>,
  fromFile: string,
  importPath: string,
): string | null {
  const basePath = resolveImportBasePath(fromFile, importPath)
  if (!basePath) return null

  for (const ext of FILE_EXTENSIONS) {
    const candidate = `${basePath}${ext}`
    if (Object.prototype.hasOwnProperty.call(files, candidate)) return candidate
  }

  for (const ext of FILE_EXTENSIONS) {
    const indexCandidate = `${basePath}/index${ext}`
    if (Object.prototype.hasOwnProperty.call(files, indexCandidate)) return indexCandidate
  }

  if (Object.prototype.hasOwnProperty.call(files, basePath)) return basePath
  return null
}

function suggestMissingFilePath(fromFile: string, importPath: string): string {
  const basePath = resolveImportBasePath(fromFile, importPath) ?? importPath

  if (/\.(tsx?|jsx?)$/.test(importPath)) {
    return basePath
  }

  const lastPart = importPath.split('/').pop() || ''
  if (lastPart === 'types' || lastPart === 'utils' || lastPart === 'lib' || lastPart === 'data') {
    return `${basePath}/index.ts`
  }

  return `${basePath}.tsx`
}

function hasDefaultExport(content: string): boolean {
  return /export\s+default\s/.test(content)
}

function hasNamedExport(content: string, name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed) return false
  return (
    new RegExp(`export\\s+(?:function|const|class|type|interface)\\s+${trimmed}\\b`).test(content) ||
    new RegExp(`export\\s*{[^}]*\\b${trimmed}\\b`).test(content)
  )
}

function parseImports(content: string): Array<{
  source: string
  defaultImport?: string
  namedImports: string[]
}> {
  const imports: Array<{
    source: string
    defaultImport?: string
    namedImports: string[]
  }> = []

  const importRegex = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null

  while ((match = importRegex.exec(content)) !== null) {
    const clause = match[1].trim()
    const source = match[2]

    if (clause.startsWith('type ')) continue

    let defaultImport: string | undefined
    const namedImports: string[] = []

    if (clause.startsWith('{')) {
      const names = clause.replace(/^{|}$/g, '').split(',')
      for (const name of names) {
        const cleaned = name.trim().split(/\s+as\s+/)[0]?.trim()
        if (cleaned) namedImports.push(cleaned)
      }
    } else if (clause.includes('{')) {
      const [defaultPart, namedPart] = clause.split('{')
      defaultImport = defaultPart.replace(/,/g, '').trim() || undefined
      const names = namedPart.replace(/}/g, '').split(',')
      for (const name of names) {
        const cleaned = name.trim().split(/\s+as\s+/)[0]?.trim()
        if (cleaned) namedImports.push(cleaned)
      }
    } else {
      defaultImport = clause.replace(/,/g, '').trim() || undefined
    }

    imports.push({ source, defaultImport, namedImports })
  }

  return imports
}

export function validatePreviewFiles(files: Record<string, string>): PreviewValidationIssue[] {
  const issues: PreviewValidationIssue[] = []
  const missingFiles = new Map<string, { importPath: string; usedBy: string[] }>()

  for (const [filePath, content] of Object.entries(files)) {
    if (filePath === '/index.html' || filePath === '/index.tsx') continue

    for (const imp of parseImports(content)) {
      if (imp.source === 'lucide-react') {
        for (const icon of imp.namedImports) {
          if (INVALID_LUCIDE_ICONS.has(icon)) {
            issues.push({
              file: filePath,
              message: `"${icon}" is not available in lucide-react (brand icons were removed). Use Mail, Phone, MapPin, or inline SVG instead.`,
            })
          }
        }
        continue
      }

      if (!imp.source.startsWith('.')) continue

      const resolved = resolveRelativeImport(files, filePath, imp.source)
      if (!resolved) {
        const suggestedPath = suggestMissingFilePath(filePath, imp.source)
        const existing = missingFiles.get(suggestedPath)
        if (existing) {
          existing.usedBy.push(filePath)
        } else {
          missingFiles.set(suggestedPath, { importPath: imp.source, usedBy: [filePath] })
        }
        continue
      }

      const targetContent = files[resolved]
      if (!targetContent) continue

      if (imp.defaultImport && !hasDefaultExport(targetContent)) {
        issues.push({
          file: filePath,
          message: `"${imp.defaultImport}" is a default import from "${imp.source}", but ${resolved} has no "export default". Use named import { ${imp.defaultImport} } or add export default.`,
        })
      }

      for (const named of imp.namedImports) {
        if (!hasNamedExport(targetContent, named) && !hasDefaultExport(targetContent)) {
          issues.push({
            file: filePath,
            message: `Named import "{ ${named} }" from "${imp.source}" does not match exports in ${resolved}. Check default vs named export.`,
          })
        } else if (!hasNamedExport(targetContent, named) && hasDefaultExport(targetContent)) {
          issues.push({
            file: filePath,
            message: `"{ ${named} }" imported from "${imp.source}" but ${resolved} only has export default. Use: import ${named} from '${imp.source}'`,
          })
        }
      }
    }
  }

  for (const [suggestedPath, { importPath, usedBy }] of missingFiles) {
    issues.unshift({
      file: usedBy.length > 2 ? `${usedBy.length} files` : usedBy.join(', '),
      message: `Missing "${suggestedPath}" (imported as "${importPath}"). Add this file to previewFiles with all exported types/interfaces.`,
    })
  }

  return issues
}

export function formatPreviewIssuesForAI(issues: PreviewValidationIssue[]): string {
  const summary = issues
    .slice(0, 8)
    .map(issue => `- ${issue.file}: ${issue.message}`)
    .join('\n')

  return `Fix the preview errors. Resolve these issues:\n${summary}\n\nRules: every imported file must exist in previewFiles; if using types, generate /types/index.ts; use "export default function ComponentName" for components; never import Facebook/Twitter/Instagram from lucide-react.`
}

function componentNameFromPath(path: string): string {
  const base = path.split('/').pop() || 'Component'
  return base.replace(/\.(tsx|ts|jsx|js)$/, '')
}

function generateTypesStub(typeNames: string[]): string {
  const names = typeNames.length > 0 ? typeNames : ['Product', 'Category', 'CartItem']
  return names
    .map(
      name => `export interface ${name} {
  id: string
  name?: string
  price?: number
  image?: string
  category?: string
  quantity?: number
  [key: string]: unknown
}`,
    )
    .join('\n\n')
    .concat('\n')
}

function generateDataStub(path: string, importHint?: string): string {
  const isProducts = /product/i.test(path) || /product/i.test(importHint || '')
  if (isProducts) {
    return `export const products = [
  { id: '1', name: 'Organic Milk', price: 62, image: 'https://placehold.co/120x120?text=Milk', category: 'Dairy' },
  { id: '2', name: 'Fresh Bread', price: 45, image: 'https://placehold.co/120x120?text=Bread', category: 'Bakery' },
  { id: '3', name: 'Bananas', price: 48, image: 'https://placehold.co/120x120?text=Banana', category: 'Fruits' },
  { id: '4', name: 'Tomatoes', price: 32, image: 'https://placehold.co/120x120?text=Tomato', category: 'Vegetables' },
  { id: '5', name: 'Potato Chips', price: 20, image: 'https://placehold.co/120x120?text=Chips', category: 'Snacks' },
  { id: '6', name: 'Cold Coffee', price: 99, image: 'https://placehold.co/120x120?text=Coffee', category: 'Beverages' },
];
export default products;
`
  }
  return `export const data = [] as const;
export default data;
`
}

function generateDefaultComponentStub(name: string): string {
  const stubs: Record<string, string> = {
    Footer: `export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
        <p>© ${new Date().getFullYear()} QuickMart</p>
        <div className="flex gap-4">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Help</span>
        </div>
      </div>
    </footer>
  );
}
`,
    ProductGrid: `import products from '../data/products';

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl border border-border bg-card p-3 hover:shadow-md transition-shadow">
          <img src={product.image} alt={product.name} className="w-full h-28 object-cover rounded-lg mb-2" />
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground mt-1">₹{product.price}</p>
        </div>
      ))}
    </div>
  );
}
`,
    CategoryFilter: `const categories = ['All', 'Dairy', 'Bakery', 'Fruits', 'Vegetables', 'Snacks', 'Beverages'];

export default function CategoryFilter() {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 border-b border-border">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className="shrink-0 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {category}
        </button>
      ))}
    </div>
  );
}
`,
    CartSidebar: `export default function CartSidebar() {
  return (
    <aside className="w-full max-w-sm border-l border-border bg-card p-4 hidden lg:block">
      <h2 className="text-sm font-semibold mb-4">Your Cart</h2>
      <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      <button type="button" className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Checkout
      </button>
    </aside>
  );
}
`,
    Navbar: `export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <span className="text-lg font-bold text-primary">QuickMart</span>
        <input
          type="search"
          placeholder="Search products..."
          className="flex-1 max-w-md rounded-full border border-border bg-muted/40 px-4 py-2 text-sm"
        />
      </div>
    </header>
  );
}
`,
  }

  if (stubs[name]) return stubs[name]

  return `export default function ${name}() {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
      ${name}
    </div>
  );
}
`
}

function generateNamedComponentStub(name: string): string {
  return `export function ${name}() {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
      ${name}
    </div>
  );
}
`
}

function generateStubForImport(
  path: string,
  imp: { defaultImport?: string; namedImports: string[] },
): string {
  if (path.includes('/types/') || path.endsWith('/types/index.ts')) {
    return generateTypesStub(imp.namedImports)
  }

  if (path.includes('/data/')) {
    return generateDataStub(path, imp.defaultImport || imp.namedImports[0])
  }

  if (imp.defaultImport) {
    return generateDefaultComponentStub(imp.defaultImport)
  }

  if (imp.namedImports.length === 1) {
    const name = imp.namedImports[0]
    return `${generateNamedComponentStub(name)}
export default ${name};
`
  }

  if (imp.namedImports.length > 1) {
    return imp.namedImports.map(generateNamedComponentStub).join('\n\n')
  }

  return generateDefaultComponentStub(componentNameFromPath(path))
}

/**
 * Fills in missing relative imports so Sandpack can load instead of showing a blank error screen.
 * Used when the model generated App.tsx but forgot component/data/type files.
 */
export function repairPreviewFiles(files: Record<string, string>): {
  files: Record<string, string>
  repairedPaths: string[]
} {
  const result = { ...files }
  const repairedPaths: string[] = []

  for (let iteration = 0; iteration < 24; iteration++) {
    let added = false

    for (const [filePath, content] of Object.entries(result)) {
      if (filePath === '/index.html' || filePath === '/index.tsx') continue

      for (const imp of parseImports(content)) {
        if (!imp.source.startsWith('.')) continue

        const resolved = resolveRelativeImport(result, filePath, imp.source)
        if (resolved) continue

        const missingPath = suggestMissingFilePath(filePath, imp.source)
        if (result[missingPath]) continue

        result[missingPath] = generateStubForImport(missingPath, imp)
        repairedPaths.push(missingPath)
        added = true
      }
    }

    if (!added) break
  }

  return { files: result, repairedPaths }
}
