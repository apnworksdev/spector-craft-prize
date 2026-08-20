import { describe, expect, it } from 'vitest'

import { mediaAlt, mediaImage, isVideo, mediaSrc } from '@/lib/media'
import type { Media } from '@/payload-types'

function media(overrides: Partial<Media> = {}): Media {
  return {
    id: 1,
    alt: 'Recipient portrait',
    updatedAt: '',
    createdAt: '',
    url: 'https://cdn.example/original.jpg',
    width: 4000,
    height: 3000,
    ...overrides,
  }
}

describe('mediaImage', () => {
  it('returns null for missing or unpopulated uploads', () => {
    expect(mediaImage(null)).toBeNull()
    expect(mediaImage(undefined)).toBeNull()
    expect(mediaImage(12)).toBeNull()
  })

  it('uses the named size when present', () => {
    const image = mediaImage(
      media({
        sizes: {
          card: {
            url: 'https://cdn.example/card.jpg',
            width: 960,
            height: 720,
          },
        },
      }),
      'card',
    )

    expect(image).toEqual({
      src: 'https://cdn.example/card.jpg',
      alt: 'Recipient portrait',
      width: 960,
      height: 720,
    })
  })

  it('falls back to the original file when the size is missing', () => {
    expect(mediaImage(media(), 'hero')).toEqual({
      src: 'https://cdn.example/original.jpg',
      alt: 'Recipient portrait',
      width: 4000,
      height: 3000,
    })
  })

  it('uses a relative path for same-origin Payload media URLs', () => {
    expect(
      mediaImage(
        media({
          url: 'http://localhost:3000/api/media/file/photo.jpg',
        }),
      )?.src,
    ).toBe('/api/media/file/photo.jpg')
  })
})

describe('mediaAlt', () => {
  it('uses the media alt text, then the fallback', () => {
    expect(mediaAlt(media(), 'Fallback')).toBe('Recipient portrait')
    expect(mediaAlt(null, 'Fallback')).toBe('Fallback')
  })
})

describe('isVideo / mediaSrc', () => {
  it('detects video uploads and returns a file URL without needing dimensions', () => {
    const video = media({
      mimeType: 'video/mp4',
      url: 'https://cdn.example/clip.mp4',
      width: null,
      height: null,
    })

    expect(isVideo(video)).toBe(true)
    expect(isVideo(media({ mimeType: 'image/jpeg' }))).toBe(false)
    expect(mediaSrc(video)).toBe('https://cdn.example/clip.mp4')
    expect(
      mediaSrc(
        media({
          mimeType: 'video/mp4',
          url: 'http://localhost:3000/api/media/file/clip.mp4',
        }),
      ),
    ).toBe('/api/media/file/clip.mp4')
    expect(mediaImage(video)).toBeNull()
  })
})
