import { describe, expect, it } from 'vitest'

import { internalDocToHref } from '@/lib/links'

describe('internalDocToHref', () => {
  it('builds edition and recipient paths from populated docs', () => {
    expect(
      internalDocToHref({
        linkNode: {
          fields: {
            doc: {
              relationTo: 'editions',
              value: { year: 2026 },
            },
          },
        },
      }),
    ).toBe('/2026-prize-recipients')

    expect(
      internalDocToHref({
        linkNode: {
          fields: {
            doc: {
              relationTo: 'prize-recipients',
              value: { slug: 'ada', edition: { year: 2026 } },
            },
          },
        },
      }),
    ).toBe('/2026-prize-recipients/ada')
  })

  it('falls back to a custom URL when there is no internal doc', () => {
    expect(
      internalDocToHref({
        linkNode: {
          fields: { url: 'https://example.com' },
        },
      }),
    ).toBe('https://example.com')
  })
})
