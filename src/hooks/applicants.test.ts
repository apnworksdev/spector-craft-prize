import { describe, expect, it, vi } from 'vitest'

import { deleteApplicantDependents } from '@/hooks/applicants'

describe('deleteApplicantDependents', () => {
  it('deletes the applicant’s applications before their files', async () => {
    const payload = {
      delete: vi.fn(async () => ({ docs: [] })),
    }
    const req = { payload }

    await deleteApplicantDependents({ id: 4, req } as never)

    expect(payload.delete).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'applications',
        overrideAccess: true,
        overrideLock: true,
        req,
        where: { applicant: { equals: 4 } },
      }),
    )
    expect(payload.delete).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'submission-files',
        overrideAccess: true,
        overrideLock: true,
        req,
        where: { applicant: { equals: 4 } },
      }),
    )
  })
})
