import { describe, expect, it } from 'vitest'

import {
  DEFAULT_FOOTER_LEGAL_NAV,
  DEFAULT_HEADER_NAV,
  isExternalNavUrl,
  normalizeNavLinks,
} from '@/lib/navigation'

describe('normalizeNavLinks', () => {
  it('falls back when empty', () => {
    expect(normalizeNavLinks([], DEFAULT_HEADER_NAV)).toEqual(DEFAULT_HEADER_NAV)
    expect(normalizeNavLinks(null, DEFAULT_HEADER_NAV)).toEqual(DEFAULT_HEADER_NAV)
  })

  it('keeps valid CMS links', () => {
    expect(
      normalizeNavLinks(
        [{ label: ' About ', url: ' /about ', openInNewTab: true }],
        DEFAULT_HEADER_NAV,
      ),
    ).toEqual([{ label: 'About', url: '/about', openInNewTab: true }])
  })

  it('drops unsafe CMS urls', () => {
    expect(
      normalizeNavLinks(
        [{ label: 'Hack', url: 'javascript:alert(1)' }],
        DEFAULT_HEADER_NAV,
      ),
    ).toEqual(DEFAULT_HEADER_NAV)
  })

  it('prefers an uploaded PDF file over the URL', () => {
    expect(
      normalizeNavLinks(
        [
          {
            label: 'FAQ',
            url: '/old.pdf',
            file: { url: 'https://cdn.example.com/faq.pdf' },
            openInNewTab: false,
          },
        ],
        DEFAULT_FOOTER_LEGAL_NAV,
      ),
    ).toEqual([
      {
        label: 'FAQ',
        url: 'https://cdn.example.com/faq.pdf',
        openInNewTab: true,
      },
    ])
  })
})

describe('isExternalNavUrl', () => {
  it('detects absolute and PDF urls', () => {
    expect(isExternalNavUrl('https://example.com')).toBe(true)
    expect(isExternalNavUrl('/documents/faq.pdf')).toBe(true)
    expect(isExternalNavUrl('/about')).toBe(false)
  })
})
