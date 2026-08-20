import { describe, expect, it } from 'vitest'

import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, uploadSizeError } from '@/lib/upload'

describe('uploadSizeError', () => {
  it('allows missing or in-limit sizes', () => {
    expect(uploadSizeError(undefined)).toBe(true)
    expect(uploadSizeError(null)).toBe(true)
    expect(uploadSizeError(MAX_UPLOAD_BYTES)).toBe(true)
  })

  it(`rejects files over ${MAX_UPLOAD_MB} MB`, () => {
    expect(uploadSizeError(MAX_UPLOAD_BYTES + 1)).toBe(
      `File must be ${MAX_UPLOAD_MB} MB or smaller. Use a compressed H.264 MP4 around 1080p.`,
    )
  })
})
