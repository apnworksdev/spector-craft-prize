import type { Access, Where } from 'payload'

import { canAccessJuryView, isAdmin } from '@/access/roles'

function ownSelectedEvaluations(jurorId: number | string): Where {
  return {
    and: [
      {
        juror: {
          equals: jurorId,
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
}

export const evaluationsRead: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (canAccessJuryView(req.user) && req.user?.id) {
    return {
      juror: {
        equals: req.user.id,
      },
    }
  }

  return false
}

export const evaluationsCreate: Access = ({ req }) => isAdmin(req.user) || canAccessJuryView(req.user)

export const evaluationsUpdate: Access = ({ req }) => {
  if (isAdmin(req.user)) {
    return true
  }

  if (canAccessJuryView(req.user) && req.user?.id) {
    return ownSelectedEvaluations(req.user.id)
  }

  return false
}
