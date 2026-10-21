import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeDeleteHook } from 'payload'

import { canAccessJuryView, isAdmin } from '@/access/roles'
import { relationId } from '@/lib/portal'

const SCORING_CLOSED = 'This application is not open for scoring.'

export const assignEvaluationJuror: CollectionBeforeChangeHook = ({ data, req }) => {
  if (canAccessJuryView(req.user) && req.user?.id) {
    return {
      ...data,
      juror: req.user.id,
    }
  }

  return data
}

export const enforceEvaluationTarget: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (isAdmin(req.user)) {
    return data
  }

  const applicationId = relationId(data?.application) ?? relationId(originalDoc?.application)
  if (!applicationId) {
    throw new APIError(SCORING_CLOSED, 403)
  }

  try {
    const application = await req.payload.findByID({
      collection: 'applications',
      depth: 0,
      id: applicationId,
      overrideAccess: false,
      req,
      user: req.user,
    })

    // Jurors cannot read `selectedForEvaluation`; collection read already scopes them
    // to submitted applications selected for evaluation.
    if (application.status !== 'submitted') {
      throw new APIError(SCORING_CLOSED, 403)
    }
  } catch (error) {
    if (error instanceof APIError && error.status === 403) {
      throw error
    }

    throw new APIError(SCORING_CLOSED, 403)
  }

  return data
}

export const deleteApplicationEvaluations: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'evaluations',
    overrideAccess: true,
    overrideLock: true,
    req,
    where: {
      application: {
        equals: id,
      },
    },
  })
}

export const deleteJurorEvaluations: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'evaluations',
    overrideAccess: true,
    overrideLock: true,
    req,
    where: {
      juror: {
        equals: id,
      },
    },
  })
}
