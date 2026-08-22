'use client'

import { useMemo } from 'react'
import type {
  ElementType,
  ReactNode,
} from 'react'

import {
  Rocket,
  Globe,
  Search,
  Gauge,
  ShieldCheck,
  Database,
  Package,
  GitBranch,
  Key,
  Lock,
  Zap,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Layers,
  FileText,
  Copy,
  ChevronRight,
  ListChecks,
  FolderTree,
  Terminal,
} from 'lucide-react'

import { toast } from 'sonner'

import {
  PublishProjectModal,
} from '@/components/dashboard/publish-project-modal'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface PlanStep {
  title?: string
  description?: string
  codeSnippet?: string
  isCommand?: boolean
  fileTarget?: string

  link?: {
    text: string
    url: string
  }
}

interface ProjectFile {
  path?: string
  content?: string
}

interface Plan {
  overview?: string

  steps?: Array<
    PlanStep | null | undefined
  >

  /**
   * previewFiles now contains the COMPLETE
   * real Vite project.
   */
  previewFiles?: Array<
    ProjectFile | null | undefined
  >

  /**
   * Legacy only.
   */
  fullStackFiles?: Array<
    ProjectFile | null | undefined
  >

  dependencies?: Record<
    string,
    string
  >
}

interface ProjectGuideProps {
  plan: Plan
  projectId: string
  idea: string
  tech: string
}

interface EnvVariable {
  key: string
  example: string
}

// ─────────────────────────────────────────────────────────────
// CODE BLOCK
// ─────────────────────────────────────────────────────────────

function CodeBlock({
  code,
  language = 'bash',
}: {
  code: string
  language?: string
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        code,
      )

      toast.success(
        'Copied to clipboard!',
      )
    } catch {
      toast.error(
        'Could not copy to clipboard.',
      )
    }
  }

  return (
    <div className="relative my-2 overflow-hidden rounded-lg border border-border bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {language}
        </span>

        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Copy className="size-3" />

          Copy
        </button>
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 font-mono text-xs text-emerald-400">
        {code}
      </pre>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: ElementType
  title: string
  color: string
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div
        className={`flex items-center gap-3 border-b border-border px-5 py-4 ${color}`}
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-background/50">
          <Icon className="size-4" />
        </div>

        <h3 className="text-sm font-semibold">
          {title}
        </h3>
      </div>

      <div className="space-y-3 p-5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function normalizePath(
  path: string,
): string {
  const normalized = path
    .trim()
    .replace(/\\/g, '/')

  return normalized.startsWith('/')
    ? normalized
    : `/${normalized}`
}

function parseEnvFile(
  content: string,
): EnvVariable[] {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(
      line =>
        Boolean(line) &&
        !line.startsWith('#') &&
        line.includes('='),
    )
    .map(line => {
      const separator =
        line.indexOf('=')

      const key = line
        .slice(0, separator)
        .trim()

      const value = line
        .slice(separator + 1)
        .trim()

      return {
        key,
        example:
          value ||
          'YOUR_VALUE_HERE',
      }
    })
    .filter(variable =>
      Boolean(variable.key),
    )
}

function getFileLanguage(
  path?: string,
): string {
  if (!path) return 'text'

  const extension =
    path
      .split('.')
      .pop()
      ?.toLowerCase()

  switch (extension) {
    case 'tsx':
      return 'tsx'

    case 'ts':
      return 'typescript'

    case 'jsx':
      return 'jsx'

    case 'js':
      return 'javascript'

    case 'json':
      return 'json'

    case 'css':
      return 'css'

    case 'sql':
      return 'sql'

    case 'md':
      return 'markdown'

    default:
      return extension || 'text'
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function ProjectGuide({
  plan,
  projectId,
  idea,
  tech,
}: ProjectGuideProps) {
  // ───────────────────────────────────────────────────────────
  // PROJECT FILES
  // ───────────────────────────────────────────────────────────

  const projectFiles =
    useMemo(() => {
      return (
        plan.previewFiles
          ?.filter(
            (
              file,
            ): file is ProjectFile =>
              Boolean(
                file?.path &&
                  typeof file.content ===
                    'string',
              ),
          )
          .map(file => ({
            path: normalizePath(
              file.path!,
            ),

            content:
              file.content ?? '',
          })) ?? []
      )
    }, [plan.previewFiles])

  const projectFileMap =
    useMemo(() => {
      return Object.fromEntries(
        projectFiles.map(file => [
          file.path,
          file.content,
        ]),
      )
    }, [projectFiles])

  // ───────────────────────────────────────────────────────────
  // PACKAGE.JSON
  // ───────────────────────────────────────────────────────────

  const packageJson =
    useMemo(() => {
      const content =
        projectFileMap[
          '/package.json'
        ]

      if (!content) {
        return null
      }

      try {
        return JSON.parse(
          content,
        ) as {
          scripts?: Record<
            string,
            string
          >

          dependencies?: Record<
            string,
            string
          >

          devDependencies?: Record<
            string,
            string
          >
        }
      } catch {
        return null
      }
    }, [projectFileMap])

  // ───────────────────────────────────────────────────────────
  // PACKAGES
  // ───────────────────────────────────────────────────────────

  const packages =
    useMemo(() => {
      const merged = {
        ...(packageJson?.dependencies ??
          {}),

        ...(plan.dependencies ??
          {}),
      }

      return Object.entries(
        merged,
      )
        .map(
          ([name, version]) => ({
            name,
            version,
          }),
        )
        .sort((a, b) =>
          a.name.localeCompare(
            b.name,
          ),
        )
    }, [
      packageJson,
      plan.dependencies,
    ])

  // ───────────────────────────────────────────────────────────
  // ENVIRONMENT VARIABLES
  // ───────────────────────────────────────────────────────────

  const envVars =
    useMemo(() => {
      const envFile =
        projectFiles.find(file =>
          [
            '/.env.example',
            '/.env.local.example',
            '/.env.example.local',
          ].includes(file.path),
        )

      if (!envFile?.content) {
        return []
      }

      return parseEnvFile(
        envFile.content,
      )
    }, [projectFiles])

  const envFileContent =
    useMemo(() => {
      if (!envVars.length) {
        return ''
      }

      return envVars
        .map(
          variable =>
            `${variable.key}=${variable.example}`,
        )
        .join('\n')
    }, [envVars])

  // ───────────────────────────────────────────────────────────
  // DETECT FEATURES
  // ───────────────────────────────────────────────────────────

  const usesSupabase =
    useMemo(() => {
      if (
        packages.some(
          pkg =>
            pkg.name ===
            '@supabase/supabase-js',
        )
      ) {
        return true
      }

      return projectFiles.some(
        file =>
          file.path.startsWith(
            '/supabase/',
          ) ||
          file.path.includes(
            '/supabase.',
          ) ||
          file.path.includes(
            '/supabase/',
          ),
      )
    }, [
      packages,
      projectFiles,
    ])

  const usesStripe =
    useMemo(
      () =>
        packages.some(pkg =>
          pkg.name
            .toLowerCase()
            .includes('stripe'),
        ) ||
        envVars.some(variable =>
          variable.key
            .toLowerCase()
            .includes('stripe'),
        ),
      [packages, envVars],
    )

  // ───────────────────────────────────────────────────────────
  // GITIGNORE
  // ───────────────────────────────────────────────────────────

  const gitignoreContent =
    useMemo(() => {
      const generated =
        projectFileMap[
          '/.gitignore'
        ]

      if (generated) {
        return generated
      }

      return `node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
.vercel/`
    }, [projectFileMap])

  // ───────────────────────────────────────────────────────────
  // GIT COMMANDS
  // ───────────────────────────────────────────────────────────

  const gitCommands = `git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main`

  // ───────────────────────────────────────────────────────────
  // RUN COMMANDS
  // ───────────────────────────────────────────────────────────

  const installCommands = `npm install
npm run dev`

  // ───────────────────────────────────────────────────────────
  // PROJECT TYPE
  // ───────────────────────────────────────────────────────────

  const projectType =
    useMemo(() => {
      const text =
        idea.toLowerCase()

      if (
        /ecommerce|e-commerce|shop|store|product|cart/.test(
          text,
        )
      ) {
        return 'E-Commerce'
      }

      if (
        /blog|cms|article|news/.test(
          text,
        )
      ) {
        return 'Blog / Content'
      }

      if (
        /dashboard|admin|analytics/.test(
          text,
        )
      ) {
        return 'Dashboard'
      }

      if (
        /portfolio|resume|personal/.test(
          text,
        )
      ) {
        return 'Portfolio'
      }

      if (
        /saas|subscription/.test(
          text,
        )
      ) {
        return 'SaaS'
      }

      if (
        /social|chat|message/.test(
          text,
        )
      ) {
        return 'Social / Chat'
      }

      return 'Web Application'
    }, [idea])

  // ───────────────────────────────────────────────────────────
  // CHECKLIST
  // ───────────────────────────────────────────────────────────

  const checklist =
    useMemo(() => {
      const items = [
        {
          label:
            'Mobile responsiveness verified',

          icon: Gauge,

          color:
            'text-cyan-400',
        },

        {
          label:
            'Error and loading states tested',

          icon: ShieldCheck,

          color:
            'text-orange-400',
        },

        {
          label:
            '.env files excluded from Git',

          icon: Lock,

          color:
            'text-rose-400',
        },

        {
          label:
            'Code pushed to GitHub',

          icon: GitBranch,

          color:
            'text-green-400',
        },

        {
          label:
            'Production domain configured',

          icon: Globe,

          color:
            'text-blue-400',
        },

        {
          label:
            'SEO title and description reviewed',

          icon: Search,

          color:
            'text-emerald-400',
        },
      ]

      if (usesSupabase) {
        items.splice(2, 0, {
          label:
            'Supabase environment variables configured',

          icon: Key,

          color:
            'text-amber-400',
        })

        items.splice(3, 0, {
          label:
            'Supabase RLS policies verified',

          icon: Database,

          color:
            'text-purple-400',
        })
      }

      if (usesStripe) {
        items.push({
          label:
            'Stripe production keys and webhooks configured',

          icon: Zap,

          color:
            'text-violet-400',
        })
      }

      return items
    }, [
      usesSupabase,
      usesStripe,
    ])

  // ───────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background/50 p-6">
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        {/* HEADER */}

        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <Rocket className="size-40" />
          </div>

          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />

            <h2 className="text-xl font-bold text-primary">
              Production Guide
            </h2>
          </div>

          <h3 className="mb-1 text-base font-semibold">
            {projectType}
          </h3>

          <p className="relative z-10 max-w-[90%] text-sm leading-relaxed text-muted-foreground">
            Your project was generated
            using{' '}
            <strong className="text-foreground">
              {tech}
            </strong>
            . Follow this guide to run,
            configure, export and deploy
            it safely.
          </p>
        </div>

        {/* OVERVIEW */}

        {plan.overview && (
          <Section
            icon={Layers}
            title="What Was Built"
            color="bg-blue-500/5 text-blue-400"
          >
            <p className="text-foreground">
              {plan.overview}
            </p>
          </Section>
        )}

        {/* PROJECT STRUCTURE */}

        {projectFiles.length > 0 && (
          <Section
            icon={FolderTree}
            title="Generated Project"
            color="bg-cyan-500/5 text-cyan-400"
          >
            <p>
              CodewithChat generated a
              complete project containing{' '}
              <strong className="text-foreground">
                {projectFiles.length}
              </strong>{' '}
              files.
            </p>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-muted/20">
              {projectFiles.map(file => (
                <div
                  key={file.path}
                  className="flex items-center gap-2 border-b border-border/40 px-3 py-2 font-mono text-xs last:border-b-0"
                >
                  <FileText className="size-3 shrink-0 text-muted-foreground" />

                  <span className="truncate text-foreground/80">
                    {file.path}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* LOCAL SETUP */}

        <Section
          icon={Terminal}
          title="Run Locally"
          color="bg-green-500/5 text-green-400"
        >
          <p>
            Download the project ZIP,
            extract it, open the folder
            in VS Code, then run:
          </p>

          <CodeBlock
            code={installCommands}
            language="terminal"
          />

          <p className="text-xs">
            Vite normally starts the
            development server at a local
            URL shown in your terminal.
          </p>
        </Section>

        {/* PACKAGES */}

        {packages.length > 0 && (
          <Section
            icon={Package}
            title="Runtime Packages"
            color="bg-purple-500/5 text-purple-400"
          >
            <p>
              These runtime packages are
              used by the generated
              application:
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {packages.map(pkg => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-block size-2 shrink-0 rounded-full bg-emerald-500" />

                    <span className="truncate font-mono text-foreground">
                      {pkg.name}
                    </span>
                  </div>

                  <span className="ml-2 shrink-0 text-muted-foreground">
                    {pkg.version}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ENVIRONMENT VARIABLES */}

        {envVars.length > 0 && (
          <Section
            icon={Key}
            title="Environment Variables"
            color="bg-amber-500/5 text-amber-400"
          >
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
              <Lock className="mt-0.5 size-4 shrink-0" />

              <p>
                <strong>
                  Security:
                </strong>{' '}
                Never commit real API
                keys or secrets to Git.
                Keep real values in your
                local{' '}
                <code className="rounded bg-black/30 px-1">
                  .env
                </code>{' '}
                file.
              </p>
            </div>

            <p>
              The generated project
              expects these environment
              variables:
            </p>

            <CodeBlock
              code={envFileContent}
              language=".env"
            />

            <div className="space-y-2">
              {envVars.map(variable => (
                <div
                  key={variable.key}
                  className="flex items-start gap-3 text-xs"
                >
                  <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />

                  <span className="font-mono font-medium text-foreground">
                    {variable.key}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* GITIGNORE */}

        <Section
          icon={FileText}
          title=".gitignore"
          color="bg-slate-500/5 text-slate-400"
        >
          <p>
            The{' '}
            <strong className="text-foreground">
              .gitignore
            </strong>{' '}
            file prevents generated
            dependencies, build output
            and secret environment files
            from being committed.
          </p>

          <CodeBlock
            code={gitignoreContent}
            language=".gitignore"
          />
        </Section>

        {/* AI STEPS */}

        {plan.steps &&
          plan.steps.length > 0 && (
            <Section
              icon={ListChecks}
              title="Implementation Steps"
              color="bg-indigo-500/5 text-indigo-400"
            >
              <div className="space-y-6">
                {plan.steps.map(
                  (
                    step,
                    index,
                  ) => {
                    if (!step) {
                      return null
                    }

                    return (
                      <div
                        key={index}
                        className="flex gap-4"
                      >
                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {step.title ||
                              `Step ${index + 1}`}
                          </h4>

                          {step.description && (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {
                                step.description
                              }
                            </p>
                          )}

                          {step.codeSnippet && (
                            <div className="mt-2">
                              {step.fileTarget && (
                                <div className="mb-1 font-mono text-[10px] text-muted-foreground">
                                  {
                                    step.fileTarget
                                  }
                                </div>
                              )}

                              <CodeBlock
                                code={
                                  step.codeSnippet
                                }
                                language={
                                  step.isCommand
                                    ? 'terminal'
                                    : getFileLanguage(
                                        step.fileTarget,
                                      )
                                }
                              />
                            </div>
                          )}

                          {step.link && (
                            <a
                              href={
                                step.link.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              {
                                step.link.text
                              }

                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  },
                )}
              </div>
            </Section>
          )}

        {/* SUPABASE */}

        {usesSupabase && (
          <Section
            icon={Database}
            title="Supabase Setup"
            color="bg-emerald-500/5 text-emerald-400"
          >
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 size-4 shrink-0 text-emerald-400" />

              <p className="text-xs">
                This project contains a
                Supabase integration.
                Connect it to your own
                Supabase project before
                using database,
                authentication, storage
                or realtime features.
              </p>
            </div>

            <ol className="space-y-3 text-xs">
              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">
                  1
                </span>

                <span>
                  Create or select a
                  Supabase project.
                </span>
              </li>

              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">
                  2
                </span>

                <span>
                  Copy your project URL
                  and publishable key into
                  your local environment
                  variables.
                </span>
              </li>

              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">
                  3
                </span>

                <span>
                  Apply the generated SQL
                  migrations from the{' '}
                  <code className="font-mono text-foreground">
                    /supabase/migrations
                  </code>{' '}
                  folder.
                </span>
              </li>

              <li className="flex gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400">
                  4
                </span>

                <span>
                  Review Row Level
                  Security policies before
                  production.
                </span>
              </li>
            </ol>

            <CodeBlock
              code={`VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY`}
              language=".env"
            />

            <CodeBlock
              code={`import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)`}
              language="typescript"
            />

            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Supabase Documentation

              <ExternalLink className="size-3" />
            </a>
          </Section>
        )}

        {/* GITHUB */}

        <Section
          icon={GitBranch}
          title="Push to GitHub"
          color="bg-green-500/5 text-green-400"
        >
          <ol className="space-y-2 text-xs">
            {[
              'Download and extract the project ZIP.',
              'Open the project folder in VS Code.',
              'Run npm install and test the project locally.',
              'Create an empty repository on GitHub.',
              'Run the commands below from the project folder.',
            ].map(
              (
                description,
                index,
              ) => (
                <li
                  key={
                    description
                  }
                  className="flex items-start gap-2"
                >
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                    {index + 1}
                  </span>

                  <span>
                    {description}
                  </span>
                </li>
              ),
            )}
          </ol>

          <CodeBlock
            code={gitCommands}
            language="terminal"
          />

          <a
            href="https://github.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Create GitHub repository

            <ExternalLink className="size-3" />
          </a>
        </Section>

        {/* PRODUCTION CHECKLIST */}

        <Section
          icon={Rocket}
          title="Pre-Launch Checklist"
          color="bg-primary/5 text-primary"
        >
          <p className="text-xs">
            Verify these items before
            deploying your application:
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {checklist.map(
              ({
                label,
                icon: Icon,
                color,
              }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs"
                >
                  <Icon
                    className={`size-3.5 shrink-0 ${color}`}
                  />

                  <span>
                    {label}
                  </span>
                </div>
              ),
            )}
          </div>
        </Section>

        {/* DEPLOY */}

        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 to-violet-500/10 p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-8 shrink-0 text-primary" />

            <div>
              <h4 className="font-semibold">
                Ready to deploy?
              </h4>

              <p className="text-xs text-muted-foreground">
                Test the project
                locally, configure its
                environment variables,
                then publish it.
              </p>
            </div>
          </div>

          <PublishProjectModal
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  )
}