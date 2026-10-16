import { describe, expect, it } from 'vitest'

import { applicationFileIds } from '@/lib/application-files'

describe('applicationFileIds', () => {
  it('collects work, portfolio, video, and id files', () => {
    const files = {
      workImages: [
        { file: 1, title: 'A' },
        { file: { id: 2 } },
      ],
      portfolioImages: [{ file: 2 }],
      workVideo: 3,
      governmentId: { id: 4 },
    }

    expect(applicationFileIds(files)).toEqual([1, 2, 3, 4])
    expect(applicationFileIds(files, { includeIdentity: false })).toEqual([1, 2, 3])
  })

  it('ignores missing files', () => {
    expect(applicationFileIds({})).toEqual([])
  })
})
