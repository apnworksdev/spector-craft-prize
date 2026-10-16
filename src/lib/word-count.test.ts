import { describe, expect, it } from 'vitest'

import { wordCount, wordCountError } from '@/lib/word-count'

describe('wordCount', () => {
  it('counts trimmed words', () => {
    expect(wordCount('one two three')).toBe(3)
    expect(wordCount('')).toBe(0)
  })
})

describe('wordCountError', () => {
  it('returns true within limit', () => {
    expect(wordCountError('one two', 3)).toBe(true)
  })

  it('returns an error over the limit', () => {
    expect(wordCountError('one two three', 2)).toMatch(/Currently 3/)
  })
})
