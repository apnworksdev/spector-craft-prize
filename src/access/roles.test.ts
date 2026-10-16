import { describe, expect, it } from 'vitest'

import { canAccessJuryView, isAdmin, isApplicantUser, isJuror, isStaffUser } from '@/access/roles'

describe('portal roles', () => {
  it('detects admin, juror, and applicant users', () => {
    expect(isAdmin({ collection: 'users', role: 'admin' })).toBe(true)
    expect(isJuror({ collection: 'users', role: 'juror' })).toBe(true)
    expect(isApplicantUser({ collection: 'applicants' })).toBe(true)
    expect(isStaffUser({ collection: 'users', role: 'admin' })).toBe(true)
    expect(isStaffUser({ collection: 'applicants' })).toBe(false)
  })

  it('gates jury view with canJury for admins', () => {
    expect(canAccessJuryView({ collection: 'users', role: 'juror' })).toBe(true)
    expect(canAccessJuryView({ collection: 'users', role: 'admin', canJury: true })).toBe(true)
    expect(canAccessJuryView({ collection: 'users', role: 'admin', canJury: false })).toBe(false)
  })
})
