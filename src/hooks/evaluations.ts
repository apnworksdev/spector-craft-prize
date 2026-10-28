import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type Payload,
  type PayloadRequest,
} from 'payload'

import { canAccessJuryView, isAdmin } from '@/access/roles'
import {
  evaluationTotal,
  medianEvaluationTotal,
  type JuryScoreValues,
} from '@/lib/jury-scores'
import { relationId } from '@/lib/portal'
import { publicSlug, uniquePublicSlug } from '@/lib/public-slug'

const SCORING_CLOSED = 'This application is not open for scoring.'

function scoresFromData(
  data: Record<string, unknown> | undefined,
  originalDoc: Record<string, unknown> | undefined,
): JuryScoreValues | null {
  const read = (key: keyof JuryScoreValues) => {
    const value = data?.[key] ?? originalDoc?.[key]
    return typeof value === 'number' ? value : null
  }

  const artisticExcellence = read('artisticExcellence')
  const culturalSignificance = read('culturalSignificance')
  const growthPotential = read('growthPotential')
  const missionAlignment = read('missionAlignment')

  if (
    artisticExcellence == null ||
    culturalSignificance == null ||
    growthPotential == null ||
    missionAlignment == null
  ) {
    return null
  }

  return { artisticExcellence, culturalSignificance, growthPotential, missionAlignment }
}

export const assignEvaluationJuror: CollectionBeforeChangeHook = ({ data, req }) => {
  if (canAccessJuryView(req.user) && req.user?.id) {
    return {
      ...data,
      juror: req.user.id,
    }
  }

  return data
}

/** Persist sum of the four criteria (max 20) for CMS list columns and sorting. */
export const assignEvaluationTotal: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const scores = scoresFromData(
    data as Record<string, unknown> | undefined,
    originalDoc as Record<string, unknown> | undefined,
  )
  if (!scores) {
    return data
  }

  return {
    ...data,
    total: evaluationTotal(scores),
  }
}

export const syncEvaluationIdentity: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) {
    return data
  }

  const applicationId = relationId(data.application) ?? relationId(originalDoc?.application)
  const jurorId = relationId(data.juror) ?? relationId(originalDoc?.juror)
  if (!applicationId || !jurorId) {
    return data
  }

  const currentSlug = typeof originalDoc?.slug === 'string' ? originalDoc.slug.trim() : ''
  const currentTitle = typeof originalDoc?.listTitle === 'string' ? originalDoc.listTitle.trim() : ''
  const sameTarget =
    relationId(originalDoc?.application) === applicationId &&
    relationId(originalDoc?.juror) === jurorId
  if (sameTarget && currentSlug && currentTitle) {
    return data
  }

  const [application, juror] = await Promise.all([
    req.payload
      .findByID({
        collection: 'applications',
        id: applicationId,
        depth: 0,
        overrideAccess: true,
        req,
      })
      .catch(() => null),
    req.payload
      .findByID({
        collection: 'users',
        id: jurorId,
        depth: 0,
        overrideAccess: true,
        req,
      })
      .catch(() => null),
  ])

  const applicationName =
    application?.listTitle?.trim() ||
    application?.artistName?.trim() ||
    application?.fullName?.trim() ||
    'Application'
  const jurorName =
    juror?.listTitle?.trim() ||
    [juror?.firstName, juror?.lastName].filter((part) => part?.trim()).join(' ').trim() ||
    juror?.email ||
    'Juror'
  const listTitle = `${applicationName} · ${jurorName}`
  const applicationSlug = application?.slug?.trim().toLowerCase() || publicSlug(applicationName)
  const base = `${applicationSlug}-${publicSlug(jurorName)}`
  const current = typeof originalDoc?.slug === 'string' ? originalDoc.slug : ''
  const slug =
    current === base || current.startsWith(`${base}-`)
      ? current
      : await uniquePublicSlug(req.payload, 'evaluations', base, originalDoc?.id)

  return {
    ...data,
    listTitle,
    slug,
  }
}

export async function backfillEvaluationIdentities(payload: Payload) {
  try {
    const result = await payload.find({
      collection: 'evaluations',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
    })

    for (const doc of result.docs) {
      const applicationId = relationId(doc.application)
      const jurorId = relationId(doc.juror)
      const [application, juror] = await Promise.all([
        applicationId
          ? payload
              .findByID({
                collection: 'applications',
                id: applicationId,
                depth: 0,
                overrideAccess: true,
              })
              .catch(() => null)
          : Promise.resolve(null),
        jurorId
          ? payload
              .findByID({
                collection: 'users',
                id: jurorId,
                depth: 0,
                overrideAccess: true,
              })
              .catch(() => null)
          : Promise.resolve(null),
      ])
      const applicationName =
        application?.listTitle?.trim() ||
        application?.artistName?.trim() ||
        application?.fullName?.trim() ||
        'Application'
      const jurorName =
        juror?.listTitle?.trim() ||
        [juror?.firstName, juror?.lastName].filter((part) => part?.trim()).join(' ').trim() ||
        juror?.email ||
        'Juror'
      const listTitle = `${applicationName} · ${jurorName}`
      const applicationSlug = application?.slug?.trim().toLowerCase() || publicSlug(applicationName)
      const base = `${applicationSlug}-${publicSlug(jurorName)}`
      const slug = doc.slug?.trim().toLowerCase() ?? ''
      if (doc.listTitle === listTitle && (slug === base || slug.startsWith(`${base}-`))) {
        continue
      }

      await payload.update({
        collection: 'evaluations',
        id: doc.id,
        data: { listTitle: doc.listTitle || 'Evaluation' },
        overrideAccess: true,
      })
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: 'Skipped evaluation identity backfill',
    })
  }
}

export const enforceEvaluationTarget: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  // Admins and system/backfill updates (no req.user) skip the juror target check.
  // The portal save checks the target once and marks the request so this hook does not load it again.
  if (isAdmin(req.user) || !req.user || req.context?.evaluationTargetChecked) {
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

export async function syncApplicationPanelGrade(
  payload: Payload,
  applicationId: number,
  req?: PayloadRequest,
) {
  const result = await payload.find({
    collection: 'evaluations',
    where: { application: { equals: applicationId } },
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
    req,
  })

  const scores = result.docs.map((doc) => ({
    artisticExcellence: doc.artisticExcellence,
    culturalSignificance: doc.culturalSignificance,
    growthPotential: doc.growthPotential,
    missionAlignment: doc.missionAlignment,
  }))

  if (req) {
    req.context = {
      ...(req.context ?? {}),
      allowSystemApplicationUpdate: true,
    }
  }

  await payload.update({
    collection: 'applications',
    id: applicationId,
    data: {
      panelMedian: medianEvaluationTotal(scores),
      evaluationCount: scores.length,
    },
    overrideAccess: true,
    context: { allowSystemApplicationUpdate: true },
    req,
  })
}

export const refreshApplicationPanelGradeAfterChange: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  if (req.context?.deferPanelGrade) {
    return doc
  }

  const applicationId = relationId(doc.application)
  if (applicationId) {
    await syncApplicationPanelGrade(req.payload, applicationId, req)
  }
  return doc
}

export const refreshApplicationPanelGradeAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
}) => {
  const applicationId = relationId(doc?.application)
  if (applicationId) {
    await syncApplicationPanelGrade(req.payload, applicationId, req)
  }
  return doc
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

export async function backfillEvaluationTotals(payload: Payload) {
  try {
    const result = await payload.find({
      collection: 'evaluations',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
    })

    for (const doc of result.docs) {
      const total = evaluationTotal({
        artisticExcellence: doc.artisticExcellence,
        culturalSignificance: doc.culturalSignificance,
        growthPotential: doc.growthPotential,
        missionAlignment: doc.missionAlignment,
      })
      if (doc.total === total) {
        continue
      }

      await payload.update({
        collection: 'evaluations',
        id: doc.id,
        data: { total },
        overrideAccess: true,
      })
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: 'Skipped evaluation total backfill',
    })
  }
}

export async function backfillApplicationPanelGrades(payload: Payload) {
  try {
    const applications = await payload.find({
      collection: 'applications',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
    })

    for (const application of applications.docs) {
      await syncApplicationPanelGrade(payload, application.id)
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: 'Skipped application panel grade backfill',
    })
  }
}
