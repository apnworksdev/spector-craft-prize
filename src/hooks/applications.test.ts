import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { assertApplicationFileOwnership } from '@/hooks/applications'

const applicant = { id: 5, collection: 'applicants' as const }
const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }

describe('assertApplicationFileOwnership', () => {
  it('rejects files that belong to another applicant', async () => {
    const find = vi.fn(async () => ({ docs: [{ id: 99 }] }))

    await expect(
      assertApplicationFileOwnership({
        data: { workImages: [{ file: 99 }] },
        originalDoc: { applicant: 5 },
        req: { user: applicant, payload: { find } },
      } as never),
    ).rejects.toBeInstanceOf(APIError)

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'submission-files',
        where: {
          and: [{ id: { in: [99] } }, { applicant: { not_equals: 5 } }],
        },
      }),
    )
  })

  it('allows an applicant to attach their own files', async () => {
    const find = vi.fn(async () => ({ docs: [] }))

    await expect(
      assertApplicationFileOwnership({
        data: { workImages: [{ file: 3 }] },
        originalDoc: { applicant: 5 },
        req: { user: applicant, payload: { find } },
      } as never),
    ).resolves.toEqual({ workImages: [{ file: 3 }] })
  })

  it('does not extra-restrict admins', async () => {
    const find = vi.fn()

    await expect(
      assertApplicationFileOwnership({
        data: { workImages: [{ file: 99 }] },
        req: { user: admin, payload: { find } },
      } as never),
    ).resolves.toEqual({ workImages: [{ file: 99 }] })

    expect(find).not.toHaveBeenCalled()
  })
})
