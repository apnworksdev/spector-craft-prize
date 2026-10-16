import type { Access, Where } from 'payload'

import { isAdmin, isApplicantUser, isJuror } from '@/access/roles'

const jurorSubmissionFilesRead: Where = {
  and: [
    {
      kind: {
        not_equals: 'id',
      },
    },
    {
      'application.status': {
        equals: 'submitted',
      },
    },
    {
      'application.selectedForEvaluation': {
        equals: true,
      },
    },
  ],
}

export const submissionFilesRead: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (isJuror(req.user)) {
    return jurorSubmissionFilesRead
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

export const submissionFilesCreate: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  return isApplicantUser(req.user)
}

export const submissionFilesUpdate: Access = ({ req }) => isAdmin(req.user)

export const submissionFilesDelete: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
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
