export interface LegacyFullStackFile {
  path?: string
  content?: string
}

/**
 * @deprecated
 *
 * CodewithChat no longer generates a separate fullStackFiles project.
 *
 * The complete real project now lives inside `previewFiles`.
 *
 * This function is kept temporarily so older saved projects and
 * existing imports do not break.
 */
export function buildFullStackFiles(
  fullStackFiles:
    | Array<LegacyFullStackFile | null | undefined>
    | undefined,
): Record<string, string> {
  const files: Record<string, string> = {}

  if (!fullStackFiles?.length) {
    return files
  }

  for (const file of fullStackFiles) {
    if (
      !file?.path ||
      typeof file.content !== 'string'
    ) {
      continue
    }

    const normalizedPath = file.path
      .trim()
      .replace(/\\/g, '/')

    if (!normalizedPath) {
      continue
    }

    const path = normalizedPath.startsWith('/')
      ? normalizedPath
      : `/${normalizedPath}`

    files[path] = file.content
  }

  return files
}

/**
 * @deprecated
 *
 * Only used for detecting old saved fullStackFiles projects.
 *
 * New CodewithChat projects should use previewFiles instead.
 */
export function hasFullStackProject(
  files: Record<string, string>,
): boolean {
  return Boolean(
    files &&
      typeof files === 'object' &&
      files['/package.json'],
  )
}