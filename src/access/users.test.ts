import { describe, expect, it } from 'vitest'

import { adminField } from '@/access/roles'
import { usersRead, usersUpdate } from '@/access/users'

const admin = { id: 1, collection: 'users' as const, role: 'admin' as const }
const juror = { id: 2, collection: 'users' as const, role: 'juror' as const }
const applicant = { id: 5, collection: 'applicants' as const }

describe('usersRead', () => {
  it('lets admins read every staff user and jurors only themselves', () => {
    expect(usersRead({ req: { user: admin } } as never)).toBe(true)
    expect(usersRead({ req: { user: juror } } as never)).toEqual({
      id: { equals: 2 },
    })
    expect(usersRead({ req: { user: applicant } } as never)).toBe(false)
  })
})

describe('usersUpdate', () => {
  it('lets jurors update only their own account', () => {
    expect(usersUpdate({ req: { user: juror } } as never)).toEqual({
      id: { equals: 2 },
    })
    expect(usersUpdate({ req: { user: admin } } as never)).toBe(true)
    expect(usersUpdate({ req: { user: applicant } } as never)).toBe(false)
  })
})

describe('staff privilege fields', () => {
  it('keeps role and canJury admin-only', () => {
    expect(adminField({ req: { user: admin } } as never)).toBe(true)
    expect(adminField({ req: { user: juror } } as never)).toBe(false)
  })
})
