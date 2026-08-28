'use client'

import {
  useMemo,
} from 'react'

import {
  SandpackProvider,
  SandpackPreview,
  defaultDark,
} from '@codesandbox/sandpack-react'

import {
  getProjectRuntimeDependencies,
  buildPreviewIndexHtml,
} from '@/lib/preview-files'

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
      const previewFileInputs =
        Object.entries(files).map(
          ([path, content]) => ({
            path,
            content,
          }),
        )

      const merged =
        getProjectRuntimeDependencies(
          previewFileInputs,
          dependencies,
        )

      return {
        ...merged,

        react: '18.2.0',

        'react-dom': '18.2.0',

        ...(merged['react-router-dom'] ||
        Object.values(files).some(
          content =>
            typeof content === 'string' &&
            content.includes('react-router-dom'),
        )
          ? {
              'react-router-dom':
                merged['react-router-dom'] ??
                '^6.28.0',
            }
          : {}),
      }
    }, [files, dependencies])

  // ─────────────────────────────────────────────
  // SANDPACK FILE FORMAT
  // ─────────────────────────────────────────────

  const sandpackFiles =
    useMemo(() => {
      const result = Object.fromEntries(
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

      // Sandpack's vite-react-ts template ships its own config.
      // Generated project config files override it and break dependency injection.
      delete result['/package.json']
      delete result['/package-lock.json']
      delete result['/tsconfig.json']
      delete result['/vite.config.ts']
      delete result['/vite.config.js']
      delete result['/tailwind.config.js']
      delete result['/tailwind.config.ts']
      delete result['/postcss.config.js']

      if (!result['/index.html']) {
        const entry =
          result['/index.tsx']
            ? '/index.tsx'
            : result['/index.jsx']
              ? '/index.jsx'
              : null

        if (entry) {
          result['/index.html'] = {
            code:
              buildPreviewIndexHtml(
                entry,
              ),
          }
        }
      }

      return result
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
          bundlerTimeOut: 180000,
          experimental_enableStableServiceWorkerId: true,
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