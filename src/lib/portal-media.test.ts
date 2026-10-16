import { describe, expect, it } from 'vitest'

import {
  applicationImageError,
  applicationVideoError,
  governmentIdError,
  groupImageSets,
  submissionFileUrl,
} from '@/lib/portal-media'

describe('applicationImageError', () => {
  it('accepts valid jpeg files', () => {
    expect(
      applicationImageError({
        mimeType: 'image/jpeg',
        filesize: 1_000_000,
        width: 1200,
        height: 900,
      }),
    ).toBe(true)
  })

  it('accepts webp files', () => {
    expect(
      applicationImageError({
        mimeType: 'image/webp',
        filesize: 1_000_000,
        width: 1200,
        height: 900,
      }),
    ).toBe(true)
  })

  it('rejects invalid image files', () => {
    expect(applicationImageError({ mimeType: 'image/gif' })).toBe('Images must be JPEG, PNG, or WebP.')
  })
})

describe('applicationVideoError', () => {
  it('accepts mp4 within size limit', () => {
    expect(applicationVideoError({ mimeType: 'video/mp4', filesize: 5 * 1024 * 1024 })).toBe(true)
  })
})

describe('governmentIdError', () => {
  it('accepts pdf and webp ids', () => {
    expect(governmentIdError({ mimeType: 'application/pdf' })).toBe(true)
    expect(governmentIdError({ mimeType: 'image/webp' })).toBe(true)
  })
})

describe('submissionFileUrl', () => {
  it('uses the populated file url when present', () => {
    expect(submissionFileUrl({ id: 3, url: '/api/submission-files/file/bowl.jpg' })).toBe(
      '/api/submission-files/file/bowl.jpg',
    )
  })

  it('falls back to the filename route', () => {
    expect(submissionFileUrl({ id: 3, filename: 'bowl.jpg' })).toBe(
      '/api/submission-files/file/bowl.jpg',
    )
  })

  it('returns null for unpopulated ids', () => {
    expect(submissionFileUrl(3)).toBeNull()
    expect(submissionFileUrl(null)).toBeNull()
  })
})

describe('groupImageSets', () => {
  it('groups images that share a set', () => {
    const groups = groupImageSets([
      { setId: 'a', file: 1, title: 'Vessel' },
      { setId: 'a', file: 2, title: 'Vessel' },
      { setId: 'b', file: 3, title: 'Bowl' },
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0]?.entries).toHaveLength(2)
    expect(groups[1]?.entries[0]?.title).toBe('Bowl')
  })
})
