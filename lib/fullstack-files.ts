export function buildFullStackFiles(
  fullStackFiles: Array<{ path?: string; content?: string } | null | undefined> | undefined,
): Record<string, string> {
  const filesObj: Record<string, string> = {}
  if (!fullStackFiles?.length) return filesObj

  for (const file of fullStackFiles) {
    if (!file?.path || !file?.content) continue
    const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`
    filesObj[normalizedPath] = file.content
  }

  return filesObj
}

export function hasFullStackProject(files: Record<string, string>): boolean {
  return Boolean(files['/package.json'])
}
