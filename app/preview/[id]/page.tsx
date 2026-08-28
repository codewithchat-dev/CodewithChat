import { getProjectByIdAction } from '@/app/actions/projects'


import {
  buildInstantPreviewFiles,
  getProjectRuntimeDependencies,
} from '@/lib/preview-files'

import {
  buildFullStackFiles,
} from '@/lib/fullstack-files'

import {
  PreviewClient,
} from './preview-client'

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PreviewPage({
  params,
}: PageProps) {
  const { id: projectId } =
    await params

  const result =
    await getProjectByIdAction(
      projectId,
    )

  if (
    !result.success ||
    !result.data ||
    !result.data.code
  ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
        No preview available for this
        project.
      </div>
    )
  }

  try {
    const plan =
      JSON.parse(
        result.data.code,
      )

    // ─────────────────────────────────────────────
    // LEGACY SUPPORT
    // ─────────────────────────────────────────────

    const legacyFullStackFiles =
      buildFullStackFiles(
        plan.fullStackFiles,
      )

    // ─────────────────────────────────────────────
    // BUILD SANDPACK RUNTIME FILES ON SERVER
    // ─────────────────────────────────────────────

    const previewFiles =
      buildInstantPreviewFiles(
        plan.previewFiles,
        legacyFullStackFiles,
        true,
      )

    if (
      Object.keys(previewFiles)
        .length === 0
    ) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
          This project does not contain
          runnable preview files.
        </div>
      )
    }

    // ─────────────────────────────────────────────
    // RUNTIME DEPENDENCIES
    // ─────────────────────────────────────────────

    const dependencies =
      getProjectRuntimeDependencies(
        plan.previewFiles,
        plan.dependencies ?? {},
      )

    return (
      <PreviewClient
        files={previewFiles}
        dependencies={
          dependencies
        }
      />
    )
  } catch (error) {
    console.error(
      '[Preview] Failed to load project:',
      error,
    )

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background px-6 text-center text-sm text-muted-foreground">
        Failed to load this project
        preview.
      </div>
    )
  }
}