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

  it('does not enforce minimum dimensions', () => {
    expect(
      applicationImageError({
        mimeType: 'image/jpeg',
        filesize: 500_000,
        width: 400,
        height: 300,
      }),
    ).toBe(true)
  })

  it('rejects images over 2 MB', () => {
    expect(
      applicationImageError({
        mimeType: 'image/jpeg',
        filesize: 3 * 1024 * 1024,
        width: 400,
        height: 300,
      }),
    ).toBe('Each image must be 2 MB or smaller.')
  })
})

describe('applicationVideoError', () => {
  it('accepts mp4 within size limit', () => {
    expect(applicationVideoError({ mimeType: 'video/mp4', filesize: 5 * 1024 * 1024 })).toBe(true)
  })
})

describe('governmentIdError', () => {
  it('accepts jpg, png, and pdf', () => {
    expect(governmentIdError({ mimeType: 'image/jpeg' })).toBe(true)
    expect(governmentIdError({ mimeType: 'image/jpg' })).toBe(true)
    expect(governmentIdError({ mimeType: 'image/png' })).toBe(true)
    expect(governmentIdError({ mimeType: 'application/pdf' })).toBe(true)
  })

  it('accepts pdf and webp ids', () => {
    expect(governmentIdError({ mimeType: 'application/pdf' })).toBe(true)
    expect(governmentIdError({ mimeType: 'image/webp' })).toBe(true)
  })
})

describe('submissionFileUrl', () => {
  it('uses the portal route when the file id is present', () => {
    expect(submissionFileUrl({ id: 3, url: '/api/submission-files/file/bowl.jpg' })).toBe(
      '/api/portal/submission-files/3',
    )
  })

  it('falls back to the filename route when id is missing', () => {
    expect(submissionFileUrl({ filename: 'bowl.jpg' })).toBe(
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
