export const APPLICATION_IMAGE_MAX = 5
export const APPLICATION_IMAGE_MIN_WIDTH = 800
export const APPLICATION_IMAGE_MIN_HEIGHT = 600
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
  'image/png',
  'image/webp',
  'application/pdf',
] as const

export const APPLICATION_IMAGE_HELP =
  'Add several views of the same work in one upload and fill in the details once. To title a different work or a piece in a series, add another set. Images should have a white or neutral background. Maximum 5 images. JPEG, PNG, or WebP, at least 800 × 600 px, max 2 MB each.'

export const PORTFOLIO_IMAGE_HELP =
  'Representative works that highlight your artistic development. Optional. You can group several images of one work, or add a separate set for each piece. Maximum 5 images. JPEG, PNG, or WebP, at least 800 × 600 px, max 2 MB each.'

export const APPLICATION_VIDEO_HELP =
  'Optional. Short video showing your work or process. MP4, maximum 90 seconds, maximum 10 MB.'

type FileLike = {
  mimeType?: string | null
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

  if (
    typeof file.width === 'number' &&
    typeof file.height === 'number' &&
    (file.width < APPLICATION_IMAGE_MIN_WIDTH || file.height < APPLICATION_IMAGE_MIN_HEIGHT)
  ) {
    return `Images must be at least ${APPLICATION_IMAGE_MIN_WIDTH} × ${APPLICATION_IMAGE_MIN_HEIGHT} px.`
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
  const type = file.mimeType || ''

  if (type && !GOVERNMENT_ID_TYPES.includes(type as (typeof GOVERNMENT_ID_TYPES)[number])) {
    return 'Government ID must be JPEG, PNG, WebP, or PDF.'
  }

  if (typeof file.filesize === 'number' && file.filesize > 10 * 1024 * 1024) {
    return 'Government ID must be 10 MB or smaller.'
  }

  return true
}

type SubmissionFileRef = {
  id?: number
  url?: string | null
  filename?: string | null
}

export function submissionFileUrl(
  file: SubmissionFileRef | number | null | undefined,
): string | null {
  if (!file || typeof file === 'number') {
    return null
  }

  if (file.url?.trim()) {
    return file.url
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
