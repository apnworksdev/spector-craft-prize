import { describe, expect, it } from 'vitest'

import { vimeoEmbedSrc, vimeoVideoId, vimeoVideoRef } from '@/lib/vimeo'

describe('vimeoVideoId', () => {
  it('parses common Vimeo URL shapes', () => {
    expect(vimeoVideoId('https://vimeo.com/123456789')).toBe('123456789')
    expect(vimeoVideoId('https://www.vimeo.com/123456789')).toBe('123456789')
    expect(vimeoVideoId('https://player.vimeo.com/video/123456789')).toBe('123456789')
    expect(vimeoVideoId('https://vimeo.com/manage/videos/123456789')).toBe('123456789')
    expect(vimeoVideoId('123456789')).toBe('123456789')
  })

  it('parses unlisted privacy hashes', () => {
    expect(vimeoVideoRef('https://vimeo.com/123456789/abcdef12')).toEqual({
      id: '123456789',
      hash: 'abcdef12',
    })
    expect(vimeoVideoRef('https://player.vimeo.com/video/123456789?h=abcdef12')).toEqual({
      id: '123456789',
      hash: 'abcdef12',
    })
  })

  it('returns null for empty or invalid values', () => {
    expect(vimeoVideoId(null)).toBeNull()
    expect(vimeoVideoId('')).toBeNull()
    expect(vimeoVideoId('https://example.com/video')).toBeNull()
    expect(vimeoVideoId('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
  })
})

describe('vimeoEmbedSrc', () => {
  it('builds a chromeless muted autoplay embed', () => {
    const src = vimeoEmbedSrc('https://vimeo.com/123456789')
    expect(src).toMatch(/^https:\/\/player\.vimeo\.com\/video\/123456789\?/)
    const params = new URL(src!).searchParams
    expect(params.get('autoplay')).toBe('1')
    expect(params.get('muted')).toBe('1')
    expect(params.get('controls')).toBe('0')
    expect(params.get('title')).toBe('0')
  })

  it('includes privacy hash when present', () => {
    const src = vimeoEmbedSrc('https://vimeo.com/123456789/abcdef12')
    expect(new URL(src!).searchParams.get('h')).toBe('abcdef12')
  })
})
