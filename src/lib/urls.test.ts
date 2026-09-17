import { describe, expect, it } from 'vitest'

import { isSafeHref, isSafeHttpUrl, safeHref } from '@/lib/urls'

describe('isSafeHref', () => {
  it('allows site paths, hashes, and http(s)/mailto/tel', () => {
    expect(isSafeHref('/about')).toBe(true)
    expect(isSafeHref('#jury')).toBe(true)
    expect(isSafeHref('https://example.com/story')).toBe(true)
    expect(isSafeHref('mailto:hi@example.com')).toBe(true)
    expect(isSafeHref('tel:+15555550100')).toBe(true)
  })

  it('rejects script and protocol-relative URLs', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false)
    expect(isSafeHref('data:text/html,hi')).toBe(false)
    expect(isSafeHref('//evil.example/phish')).toBe(false)
    expect(isSafeHref('vbscript:msgbox(1)')).toBe(false)
  })
})

describe('isSafeHttpUrl', () => {
  it('requires an absolute http(s) URL', () => {
    expect(isSafeHttpUrl('https://example.com/a')).toBe(true)
    expect(isSafeHttpUrl('/about')).toBe(false)
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('safeHref', () => {
  it('falls back when the value is missing or unsafe', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com')
    expect(safeHref(' javascript:alert(1) ')).toBe('#')
    expect(safeHref('', '/')).toBe('/')
  })
})
