import type { Access, Where } from 'payload'

import { isAdmin, isApplicantUser, isJuror } from '@/access/roles'

// Do not filter on `application.selectedForEvaluation` here: that field is not
// readable by jurors (`notJurorField`), and nested Where clauses against it make
// Payload's `/api/submission-files/file/...` handler return 403 even for media
// the jury portal is allowed to show. Application collection access already
// scopes jurors to selected apps; portal media re-checks readability.
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
