export const APPLICATION_IMAGE_MAX = 5
export const APPLICATION_IMAGE_MAX_BYTES = 2 * 1024 * 1024
export const APPLICATION_VIDEO_MAX_BYTES = 10 * 1024 * 1024
export const APPLICATION_VIDEO_MAX_SECONDS = 90
export const BIO_SUMMARY_MAX_WORDS = 150
export const ARTIST_STATEMENT_MAX_WORDS = 200
export const WORK_DESCRIPTION_MAX_WORDS = 100
export const WORK_SIGNIFICANCE_MAX_WORDS = 100
export const WHY_PRIZE_MAX_WORDS = 125
export const ADDITIONAL_DETAILS_MAX_WORDS = 100

export const APPLICATION_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const APPLICATION_VIDEO_TYPES = ['video/mp4'] as const
export const GOVERNMENT_ID_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/x-png',
  'image/webp',
  'application/pdf',
] as const

/** Picker list. Extensions are included so JPG and PNG are offered, not only PDF. */
export const GOVERNMENT_ID_ACCEPT = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  ...GOVERNMENT_ID_TYPES,
].join(',')

const GOVERNMENT_ID_EXT_MIME: Record<string, (typeof GOVERNMENT_ID_TYPES)[number]> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
}

/** Normalize browser/OS mime quirks; fall back to filename extension when needed. */
export function normalizeGovernmentIdMime(
  mimeType?: string | null,
  filename?: string | null,
): string {
  const raw = (mimeType || '').trim().toLowerCase()
  if (raw === 'image/pjpeg' || raw === 'image/jpg') {
    return 'image/jpeg'
  }
  if (raw === 'image/x-png') {
    return 'image/png'
  }
  if (raw && raw !== 'application/octet-stream') {
    return raw
  }

  const ext = filename?.trim().split('.').pop()?.toLowerCase()
  if (ext && GOVERNMENT_ID_EXT_MIME[ext]) {
    return GOVERNMENT_ID_EXT_MIME[ext]
  }

  return raw
}

export const APPLICATION_IMAGE_NAMING =
  'Name files with your full name plus a number or description (e.g., FirstnameLastname_SubmittedWork1 or FirstnameLastname_CareerPortfolio1).'

export const APPLICATION_IMAGE_LIMITS =
  'Add several views of the same work in one upload and fill in the details once. To title a different work or a piece in a series, add another set. Images should have a white or neutral background. Maximum 5 images. JPEG, PNG, or WebP, max 2 MB each.'

export const PORTFOLIO_IMAGE_LIMITS =
  'Representative works that highlight your artistic development. Optional. You can group several images of one work, or add a separate set for each piece. Maximum 5 images. JPEG, PNG, or WebP, max 2 MB each.'

/** Full help string for Payload admin descriptions (naming + limits). */
export const APPLICATION_IMAGE_HELP = `${APPLICATION_IMAGE_NAMING} ${APPLICATION_IMAGE_LIMITS}`

export const PORTFOLIO_IMAGE_HELP = `${APPLICATION_IMAGE_NAMING} ${PORTFOLIO_IMAGE_LIMITS}`

export const APPLICATION_VIDEO_HELP =
  'Optional. Short video showing your work or process. MP4, maximum 90 seconds, maximum 10 MB.'

type FileLike = {
  mimeType?: string | null
  filename?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  kind?: string | null
}

export function applicationImageError(file: FileLike): string | true {
  const type = file.mimeType || ''

  if (type && !APPLICATION_IMAGE_TYPES.includes(type as (typeof APPLICATION_IMAGE_TYPES)[number])) {
    return 'Images must be JPEG, PNG, or WebP.'
  }

  if (typeof file.filesize === 'number' && file.filesize > APPLICATION_IMAGE_MAX_BYTES) {
    return 'Each image must be 2 MB or smaller.'
  }

  return true
}

export function applicationVideoError(file: FileLike): string | true {
  const type = file.mimeType || ''

  if (type && !APPLICATION_VIDEO_TYPES.includes(type as (typeof APPLICATION_VIDEO_TYPES)[number])) {
    return 'Video must be MP4.'
  }

  if (typeof file.filesize === 'number' && file.filesize > APPLICATION_VIDEO_MAX_BYTES) {
    return 'Video must be 10 MB or smaller.'
  }

  return true
}

export function governmentIdError(file: FileLike): string | true {
  const type = normalizeGovernmentIdMime(file.mimeType, file.filename)
  const allowed = new Set<string>([
    ...GOVERNMENT_ID_TYPES,
    'image/jpeg',
    'image/png',
    'application/pdf',
  ])

  if (type && !allowed.has(type)) {
    return 'Government ID must be JPG, PNG, or PDF.'
  }

  if (typeof file.filesize === 'number' && file.filesize > 10 * 1024 * 1024) {
    return 'Government ID must be 10 MB or smaller.'
  }

  return true
}

/** Ensure Payload's mimeTypes check sees a real image/pdf type for ID uploads. */
export function coerceGovernmentIdFile(file: File): File {
  const normalized = normalizeGovernmentIdMime(file.type, file.name)
  if (!normalized || normalized === file.type) {
    return file
  }

  return new File([file], file.name, {
    type: normalized,
    lastModified: file.lastModified,
  })
}

type SubmissionFileRef = {
  id?: number
  url?: string | null
  filename?: string | null
}

/**
 * Portal media URLs go through `/api/portal/submission-files/:id`, which uses the
 * same staff/applicant session checks as PDF/ZIP and reads private R2 bytes
 * server-side. Preferring Payload's `/api/submission-files/file/...` (or a raw
 * `file.url`) caused intermittent 403s for jury media after HMR/restarts.
 */
export function submissionFileUrl(
  file: SubmissionFileRef | number | null | undefined,
): string | null {
  if (!file || typeof file === 'number') {
    return null
  }

  if (typeof file.id === 'number' && Number.isFinite(file.id)) {
    return `/api/portal/submission-files/${file.id}`
  }

  if (file.filename?.trim()) {
    return `/api/submission-files/file/${encodeURIComponent(file.filename)}`
  }

  return null
}

export function groupImageSets<T extends { setId?: string | null; id?: string | null }>(
  entries: T[] | null | undefined,
): Array<{ setId: string; entries: T[] }> {
  const sets: Array<{ setId: string; entries: T[] }> = []

  for (const [index, entry] of (entries ?? []).entries()) {
    const setId = entry.setId?.trim() || entry.id || `item-${index}`
    const existing = sets.find((set) => set.setId === setId)
    if (existing) {
      existing.entries.push(entry)
    } else {
      sets.push({ setId, entries: [entry] })
    }
  }

  return sets
}
