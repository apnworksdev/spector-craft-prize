import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  deleteJurorEvaluations,
  enforceEvaluationTarget,
  refreshApplicationPanelGradeAfterChange,
  syncEvaluationIdentity,
} from '@/hooks/evaluations'

const juror = { id: 2, collection: 'users' as const, role: 'juror' as const }
const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }

describe('syncEvaluationIdentity', () => {
  it('keeps an existing title and slug without loading the application again', async () => {
    const findByID = vi.fn()

    await expect(
      syncEvaluationIdentity({
        data: { artisticExcellence: 4 },
        originalDoc: {
          application: 9,
          juror: 2,
          listTitle: 'Naz Sahin · Naz Jury',
          slug: 'scp26-naz-sahin-naz-jury',
        },
        req: { payload: { findByID } },
      } as never),
    ).resolves.toEqual({ artisticExcellence: 4 })

    expect(findByID).not.toHaveBeenCalled()
  })
})

describe('refreshApplicationPanelGradeAfterChange', () => {
  it('leaves the panel grade for later when the portal defers it', async () => {
    const find = vi.fn()

    await expect(
      refreshApplicationPanelGradeAfterChange({
        doc: { application: 9 },
        req: { context: { deferPanelGrade: true }, payload: { find } },
      } as never),
    ).resolves.toEqual({ application: 9 })

    expect(find).not.toHaveBeenCalled()
  })
})

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

  it('skips the extra application load when the portal already checked the target', async () => {
    const findByID = vi.fn()

    await expect(
      enforceEvaluationTarget({
        data: { application: 9 },
        req: { user: juror, context: { evaluationTargetChecked: true }, payload: { findByID } },
      } as never),
    ).resolves.toEqual({ application: 9 })

    expect(findByID).not.toHaveBeenCalled()
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
