import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { deleteJurorEvaluations, enforceEvaluationTarget } from '@/hooks/evaluations'

const juror = { id: 2, collection: 'users' as const, role: 'juror' as const }
const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }

describe('deleteJurorEvaluations', () => {
  it('deletes evaluations owned by the user being removed', async () => {
    const deleteMany = vi.fn(async () => undefined)

    await deleteJurorEvaluations({
      id: 2,
      req: { payload: { delete: deleteMany } },
    } as never)

    expect(deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'evaluations',
        where: { juror: { equals: 2 } },
      }),
    )
  })
})

describe('enforceEvaluationTarget', () => {
  it('lets jurors score a submitted application they can read even if the selection flag is hidden', async () => {
    const findByID = vi.fn(async () => ({
      status: 'submitted',
    }))

    await expect(
      enforceEvaluationTarget({
        data: { application: 9 },
        req: { user: juror, payload: { findByID } },
      } as never),
    ).resolves.toEqual({ application: 9 })

    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'applications',
        id: 9,
        overrideAccess: false,
      }),
    )
  })

  it('blocks jurors from scoring drafts', async () => {
    const findByID = vi.fn(async () => ({
      status: 'draft',
    }))

    await expect(
      enforceEvaluationTarget({
        data: { application: 9 },
        req: { user: juror, payload: { findByID } },
      } as never),
    ).rejects.toBeInstanceOf(APIError)
  })

  it('blocks jurors from scoring applications they cannot read', async () => {
    const findByID = vi.fn(async () => {
      throw new APIError('Not found', 404)
    })

    await expect(
      enforceEvaluationTarget({
        data: { application: 9 },
        req: { user: juror, payload: { findByID } },
      } as never),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('does not extra-restrict admins', async () => {
    const findByID = vi.fn()

    await expect(
      enforceEvaluationTarget({
        data: { application: 9 },
        req: { user: admin, payload: { findByID } },
      } as never),
    ).resolves.toEqual({ application: 9 })

    expect(findByID).not.toHaveBeenCalled()
  })
})
