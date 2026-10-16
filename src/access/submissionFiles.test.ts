import { describe, expect, it } from 'vitest'

import {
  submissionFilesDelete,
  submissionFilesRead,
  submissionFilesUpdate,
} from '@/access/submissionFiles'

const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }
const juror = { id: 2, collection: 'users' as const, role: 'juror' as const }
const applicant = { id: 5, collection: 'applicants' as const }

describe('submissionFilesDelete', () => {
  it('lets an applicant delete only their own files', () => {
    expect(submissionFilesDelete({ req: { user: applicant } } as never)).toEqual({
      applicant: { equals: 5 },
    })
    expect(submissionFilesDelete({ req: { user: admin } } as never)).toBe(true)
    expect(submissionFilesDelete({ req: { user: juror } } as never)).toBe(false)
  })
})

describe('submissionFilesUpdate', () => {
  it('does not let applicants retarget kind or application on a file', () => {
    expect(submissionFilesUpdate({ req: { user: applicant } } as never)).toBe(false)
    expect(submissionFilesUpdate({ req: { user: juror } } as never)).toBe(false)
    expect(submissionFilesUpdate({ req: { user: admin } } as never)).toBe(true)
  })
})

describe('submissionFilesRead', () => {
  it('lets jurors read only non-id files on selected submitted applications', () => {
    expect(submissionFilesRead({ req: { user: juror } } as never)).toEqual({
      and: [
        { kind: { not_equals: 'id' } },
        { 'application.status': { equals: 'submitted' } },
        { 'application.selectedForEvaluation': { equals: true } },
      ],
    })
  })

  it('lets applicants read their own files', () => {
    expect(submissionFilesRead({ req: { user: applicant } } as never)).toEqual({
      applicant: { equals: 5 },
    })
  })

  it('lets admins read every file', () => {
    expect(submissionFilesRead({ req: { user: admin } } as never)).toBe(true)
  })
})

