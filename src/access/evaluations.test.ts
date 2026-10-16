import { describe, expect, it } from 'vitest'

import { evaluationsCreate, evaluationsRead, evaluationsUpdate } from '@/access/evaluations'

const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }
const scoringAdmin = { ...admin, canJury: true }
const juror = { id: 2, collection: 'users' as const, role: 'juror' as const }
const applicant = { id: 5, collection: 'applicants' as const }

describe('evaluationsRead', () => {
  it('lets admins read every score and jurors only their own', () => {
    expect(evaluationsRead({ req: { user: admin } } as never)).toBe(true)
    expect(evaluationsRead({ req: { user: juror } } as never)).toEqual({
      juror: { equals: 2 },
    })
    expect(evaluationsRead({ req: { user: applicant } } as never)).toBe(false)
  })
})

describe('evaluationsCreate', () => {
  it('lets jurors and scoring admins create scores', () => {
    expect(evaluationsCreate({ req: { user: juror } } as never)).toBe(true)
    expect(evaluationsCreate({ req: { user: scoringAdmin } } as never)).toBe(true)
    expect(evaluationsCreate({ req: { user: admin } } as never)).toBe(true)
    expect(evaluationsCreate({ req: { user: applicant } } as never)).toBe(false)
  })
})

describe('evaluationsUpdate', () => {
  it('lets a juror change only their own score on selected applications', () => {
    expect(evaluationsUpdate({ req: { user: juror } } as never)).toEqual({
      and: [
        { juror: { equals: 2 } },
        { 'application.status': { equals: 'submitted' } },
        { 'application.selectedForEvaluation': { equals: true } },
      ],
    })
    expect(evaluationsUpdate({ req: { user: admin } } as never)).toBe(true)
  })
})

