import { describe, expect, it } from 'vitest'

import { applicationStatusUpdate, governmentIdRead } from '@/access/applications'
import type { Application } from '@/payload-types'

const applicant = { id: 5, collection: 'applicants' as const }
const admin = { id: 1, collection: 'users' as const, role: 'admin' }
const juror = { id: 2, collection: 'users' as const, role: 'juror' }

function application(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    applicant: 5,
    status: 'draft',
    ...overrides,
  } as Application
}

describe('governmentIdRead', () => {
  it('lets the owner and admins read the government id', () => {
    expect(governmentIdRead({ req: { user: applicant }, doc: application() } as never)).toBe(true)
    expect(governmentIdRead({ req: { user: admin }, doc: application() } as never)).toBe(true)
  })

  it('hides the government id from jurors and other applicants', () => {
    expect(governmentIdRead({ req: { user: juror }, doc: application() } as never)).toBe(false)
    expect(
      governmentIdRead({ req: { user: { id: 9, collection: 'applicants' } }, doc: application() } as never),
    ).toBe(false)
  })
})

describe('applicationStatusUpdate', () => {
  it('lets an applicant submit their own draft', () => {
    expect(
      applicationStatusUpdate({
        req: { user: applicant },
        doc: application(),
        data: { status: 'submitted' },
      } as never),
    ).toBe(true)
  })

  it('blocks applicants from changing status any other way', () => {
    expect(
      applicationStatusUpdate({
        req: { user: applicant },
        doc: application({ status: 'submitted' }),
        data: { status: 'draft' },
      } as never),
    ).toBe(false)
    expect(
      applicationStatusUpdate({
        req: { user: juror },
        doc: application(),
        data: { status: 'submitted' },
      } as never),
    ).toBe(false)
  })
})
