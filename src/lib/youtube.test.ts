import { describe, expect, it } from 'vitest'

import { youtubeEmbedSrc, youtubeVideoId } from '@/lib/youtube'

describe('youtubeVideoId', () => {
  it('parses common YouTube URL shapes', () => {
    expect(youtubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(youtubeVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('returns null for empty or invalid values', () => {
    expect(youtubeVideoId(null)).toBeNull()
    expect(youtubeVideoId('')).toBeNull()
    expect(youtubeVideoId('https://example.com/video')).toBeNull()
  })
})

describe('youtubeEmbedSrc', () => {
  it('builds a muted autoplay embed with controls enabled', () => {
    const src = youtubeEmbedSrc('https://youtu.be/dQw4w9WgXcQ')
    expect(src).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?/)
    const params = new URL(src!).searchParams
    expect(params.get('autoplay')).toBe('1')
    expect(params.get('mute')).toBe('1')
    expect(params.get('controls')).toBe('1')
    expect(params.get('fs')).toBe('1')
  })
})
