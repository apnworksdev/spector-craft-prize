import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

import { isAdmin, isApplicantUser, isJuror, isStaffUser } from '@/access/roles'
import type { Application } from '@/payload-types'

function applicationOwnerId(doc: Application | undefined) {
  if (!doc?.applicant) {
    return undefined
  }

  return typeof doc.applicant === 'object' ? doc.applicant.id : doc.applicant
}

export const applicationsRead: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (isJuror(req.user)) {
    const where: Where = {
      and: [{ status: { equals: 'submitted' } }, { selectedForEvaluation: { equals: true } }],
    }
    return where
  }

  if (isApplicantUser(req.user) && req.user?.id) {
    return {
      applicant: {
        equals: req.user.id,
      },
    }
  }

  return false
}

export const applicationsCreate: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  return isApplicantUser(req.user)
}

export const applicationsUpdate: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (isApplicantUser(req.user) && req.user?.id) {
    const where: Where = {
      and: [{ applicant: { equals: req.user.id } }, { status: { equals: 'draft' } }],
    }
    return where
  }

  return false
}

export const applicationsDelete: Access = ({ req }) => isAdmin(req.user)

export const applicationsAdmin = ({ req }: { req: PayloadRequest }) => isStaffUser(req.user)

export const governmentIdRead: FieldAccess<Application> = ({ req, doc }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (!isApplicantUser(req.user) || req.user?.id == null) {
    return false
  }

  return applicationOwnerId(doc) === req.user.id
}

export const applicationStatusUpdate: FieldAccess<Application> = ({ req, doc, data }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (!isApplicantUser(req.user) || req.user?.id == null) {
    return false
  }

  return applicationOwnerId(doc) === req.user.id && doc?.status === 'draft' && data?.status === 'submitted'
}
