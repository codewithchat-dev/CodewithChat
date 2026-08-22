'use client'

import {
  useMemo,
} from 'react'

import {
  SandpackProvider,
  SandpackPreview,
  defaultDark,
} from '@codesandbox/sandpack-react'

type PreviewClientProps = {
  files: Record<
    string,
    string
  >

  dependencies?: Record<
    string,
    string
  >
}

const BLOCKED_DEPENDENCIES =
  new Set([
    'next',

    'vite',

    '@vitejs/plugin-react',

    '@vercel/ai',

    '@supabase/ssr',

    '@supabase/auth-helpers-nextjs',

    'typescript',

    'tailwindcss',

    'postcss',

    'autoprefixer',
  ])

export function PreviewClient({
  files,
  dependencies = {},
}: PreviewClientProps) {
  // ─────────────────────────────────────────────
  // DEPENDENCIES
  // ─────────────────────────────────────────────

  const runtimeDependencies =
    useMemo<
      Record<string, string>
    >(() => {
      const safe =
        Object.fromEntries(
          Object.entries(
            dependencies,
          ).filter(
            ([name]) =>
              !BLOCKED_DEPENDENCIES.has(
                name,
              ),
          ),
        )

      return {
        ...safe,

        react: '^18.2.0',

        'react-dom':
          '^18.2.0',

        'lucide-react':
          safe[
            'lucide-react'
          ] ?? '^0.468.0',

        clsx:
          safe.clsx ??
          '^2.1.1',

        'tailwind-merge':
          safe[
            'tailwind-merge'
          ] ?? '^2.5.4',
      }
    }, [dependencies])

  // ─────────────────────────────────────────────
  // SANDPACK FILE FORMAT
  // ─────────────────────────────────────────────

  const sandpackFiles =
    useMemo(() => {
      return Object.fromEntries(
        Object.entries(
          files,
        ).map(
          ([
            path,
            content,
          ]) => [
            path.startsWith('/')
              ? path
              : `/${path}`,

            {
              code: content,
            },
          ],
        ),
      )
    }, [files])

  return (
    <main className="h-dvh w-screen overflow-hidden bg-white">
      <SandpackProvider
      template="vite-react-ts"
        files={sandpackFiles}
        customSetup={{
          dependencies:
            runtimeDependencies,
        }}
        options={{
          externalResources: [
            'https://cdn.tailwindcss.com',
          ],
        }}
        theme={defaultDark}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html,
              body {
                margin: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
              }

              .sp-wrapper,
              .sp-layout,
              .sp-stack,
              .sp-preview-container,
              .sp-preview-iframe {
                width: 100% !important;
                height: 100% !important;
                min-height: 100% !important;
                max-height: 100% !important;
              }

              .sp-wrapper,
              .sp-layout,
              .sp-stack {
                flex: 1 !important;
                min-height: 0 !important;
              }
            `,
          }}
        />

        <div className="h-full w-full">
          <SandpackPreview
            showNavigator={
              false
            }
            showRefreshButton={
              false
            }
            showOpenInCodeSandbox={
              false
            }
            style={{
              width: '100%',
              height: '100%',
              minHeight:
                '100%',
            }}
          />
        </div>
      </SandpackProvider>
    </main>
  )
}