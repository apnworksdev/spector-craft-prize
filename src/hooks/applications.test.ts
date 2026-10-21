import { APIError } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import {
  assertApplicationFileOwnership,
  enforceApplicantOwnership,
  lockSubmittedApplications,
} from '@/hooks/applications'

const applicant = { id: 5, collection: 'applicants' as const }
const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }

const openProgram = {
  id: 7,
  status: 'live',
  deadline: '2999-01-01T12:00:00.000Z',
  declarations: [{ text: 'a' }, { text: 'b' }],
}

function payloadWithProgram(program: Record<string, unknown>) {
  return { findByID: vi.fn(async () => program) }
}

const completeDraft = {
  status: 'draft',
  program: 7,
  applicant: 5,
  fullName: 'A',
  dateOfBirth: '1990-01-01',
  addressLine1: 'A',
  city: 'A',
  state: 'A',
  postalCode: 'A',
  country: 'A',
  phone: 'A',
  email: 'a@example.com',
  yearsOfPractice: '3',
  trainingBackground: 'A',
  primaryCraftDiscipline: 'A',
  usCitizenOrResident: 'yes',
  educationalBackground: 'A',
  biographicalSummary: 'A',
  workTitle: 'A',
  workYearCreated: '2024',
  workDimensions: 'A',
  workMaterials: 'A',
  artistStatement: 'A',
  workDescription: 'A',
  workSignificance: 'A',
  whyPrize: 'A',
  workImages: [{ file: 1 }],
  governmentId: 2,
  declarationsAccepted: [{ accepted: true }, { accepted: true }],
}

describe('enforceApplicantOwnership', () => {
  it('forces applicant-created applications to start as unselected drafts', async () => {
    const result = await enforceApplicantOwnership({
      data: { program: 7, status: 'submitted', selectedForEvaluation: true, applicant: 99 },
      operation: 'create',
      req: { user: applicant, payload: payloadWithProgram(openProgram) },
    } as never)

    expect(result).toMatchObject({
      applicant: 5,
      status: 'draft',
      selectedForEvaluation: false,
      submittedAt: null,
    })
  })

  it('rejects applications for programs that are not accepting submissions', async () => {
    await expect(
      enforceApplicantOwnership({
        data: { program: 7 },
        operation: 'create',
        req: { user: applicant, payload: payloadWithProgram({ ...openProgram, status: 'closed' }) },
      } as never),
    ).rejects.toBeInstanceOf(APIError)
  })
})

describe('lockSubmittedApplications', () => {
  function submit(program: Record<string, unknown>, originalDoc: Record<string, unknown> = completeDraft) {
    return lockSubmittedApplications({
      data: { status: 'submitted' },
      operation: 'update',
      originalDoc,
      req: { user: applicant, payload: payloadWithProgram(program) },
    } as never)
  }

  it('stamps submittedAt for a complete application in an open program', async () => {
    const result = await submit(openProgram)
    expect(result).toMatchObject({ status: 'submitted' })
    expect(typeof (result as { submittedAt?: unknown }).submittedAt).toBe('string')
  })

  it('rejects submissions after the program closes', async () => {
    await expect(submit({ ...openProgram, status: 'closed' })).rejects.toBeInstanceOf(APIError)
  })

  it('rejects submissions after the deadline', async () => {
    await expect(
      submit({ ...openProgram, deadline: '2000-01-01T12:00:00.000Z' }),
    ).rejects.toBeInstanceOf(APIError)
  })

  it('requires one accepted entry per program declaration', async () => {
    await expect(
      submit(openProgram, { ...completeDraft, declarationsAccepted: [{ accepted: true }] }),
    ).rejects.toThrow('All declarations must be accepted before submitting.')
  })

  it('ignores applicant-supplied submittedAt on draft saves', async () => {
    const result = await lockSubmittedApplications({
      data: { fullName: 'B', submittedAt: '2020-01-01T00:00:00.000Z' },
      operation: 'update',
      originalDoc: completeDraft,
      req: { user: applicant, payload: payloadWithProgram(openProgram) },
    } as never)

    expect(result).toEqual({ fullName: 'B' })
  })
})

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
