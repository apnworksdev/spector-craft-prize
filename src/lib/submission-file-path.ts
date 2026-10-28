export function submissionFileApiPath(file: {
  filename?: string | null
  prefix?: string | null
}): string | null {
  if (!file.filename?.trim()) {
    return null
  }

  const base = `/api/submission-files/file/${encodeURIComponent(file.filename)}`
  const prefix = file.prefix?.trim()
  return prefix ? `${base}?prefix=${encodeURIComponent(prefix)}` : base
}
