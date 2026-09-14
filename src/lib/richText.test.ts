import { describe, expect, it } from 'vitest'

import { hasLexicalText, mediaColumnHasContent } from '@/lib/richText'

const empty = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: '' }],
      },
    ],
  },
}

const withText = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Hello' }],
      },
    ],
  },
}

describe('hasLexicalText', () => {
  it('is false for empty or missing editors', () => {
    expect(hasLexicalText(null)).toBe(false)
    expect(hasLexicalText(undefined)).toBe(false)
    expect(hasLexicalText(empty)).toBe(false)
  })

  it('is true when a text node has content', () => {
    expect(hasLexicalText(withText)).toBe(true)
  })
})

describe('mediaColumnHasContent', () => {
  it('requires media, Vimeo URL, text, or a mix', () => {
    expect(mediaColumnHasContent({ media: null, content: empty })).toBe(false)
    expect(mediaColumnHasContent({ media: 3, content: empty })).toBe(true)
    expect(mediaColumnHasContent({ media: null, content: withText })).toBe(true)
    expect(
      mediaColumnHasContent({
        media: null,
        vimeoUrl: 'https://vimeo.com/123456789',
        content: empty,
      }),
    ).toBe(true)
  })
})
