import type { Access, FieldAccess } from 'payload'

export const STAFF_ROLES = ['admin', 'juror'] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

type AuthUser = {
  id?: number | string
  collection?: string
  role?: StaffRole | string | null
  canJury?: boolean | null
} | null

export function isAdmin(user: AuthUser): boolean {
  return user?.collection === 'users' && user.role === 'admin'
}

export function isJuror(user: AuthUser): boolean {
  return user?.collection === 'users' && user.role === 'juror'
}

export function isStaffUser(user: AuthUser): boolean {
  return user?.collection === 'users' && (user.role === 'admin' || user.role === 'juror')
}

export function canAccessJuryView(user: AuthUser): boolean {
  if (!user || user.collection !== 'users') {
    return false
  }

  if (user.role === 'juror') {
    return true
  }

  return user.role === 'admin' && Boolean(user.canJury)
}

export function isApplicantUser(user: AuthUser): boolean {
  return user?.collection === 'applicants'
}

export const adminOnly: Access = ({ req }) => isAdmin(req.user)

export const staffOnly: Access = ({ req }) => isStaffUser(req.user)

export const adminField: FieldAccess = ({ req }) => isAdmin(req.user)

export const notJurorField: FieldAccess = ({ req }) => isAdmin(req.user)
