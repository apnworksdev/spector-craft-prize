import { describe, expect, it } from 'vitest'

import { submissionFileApiPath } from '@/lib/submission-file-path'

describe('submissionFileApiPath', () => {
  it('builds the Payload file route with prefix', () => {
    expect(
      submissionFileApiPath({
        filename: 'bowl.jpg',
        prefix: 'submissions',
      }),
    ).toBe('/api/submission-files/file/bowl.jpg?prefix=submissions')
  })

  it('omits prefix when absent', () => {
    expect(submissionFileApiPath({ filename: 'bowl.jpg', prefix: null })).toBe(
      '/api/submission-files/file/bowl.jpg',
    )
  })
})
