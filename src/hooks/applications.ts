import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type Payload,
  type PayloadRequest,
} from 'payload'

import { isAdmin, isApplicantUser } from '@/access/roles'
import { applicationFileIds } from '@/lib/application-files'
import { relationId } from '@/lib/portal'
import { wordCountError } from '@/lib/word-count'
import {
  ADDITIONAL_DETAILS_MAX_WORDS,
  ARTIST_STATEMENT_MAX_WORDS,
  BIO_SUMMARY_MAX_WORDS,
  WHY_PRIZE_MAX_WORDS,
  WORK_DESCRIPTION_MAX_WORDS,
  WORK_SIGNIFICANCE_MAX_WORDS,
} from '@/lib/portal-media'

export const enforceApplicantOwnership: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create' || !isApplicantUser(req.user) || !req.user?.id) {
    return data
  }

  return {
    ...data,
    applicant: req.user.id,
    status: data?.status ?? 'draft',
  }
}

export const assertApplicationFileOwnership: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (isAdmin(req.user)) {
    return data
  }

  const ownerId =
    relationId(originalDoc?.applicant) ?? (isApplicantUser(req.user) ? Number(req.user.id) : null)
  const fileIds = applicationFileIds({
    workImages: data?.workImages ?? originalDoc?.workImages,
    portfolioImages: data?.portfolioImages ?? originalDoc?.portfolioImages,
    workVideo: data?.workVideo ?? originalDoc?.workVideo,
    governmentId: data?.governmentId ?? originalDoc?.governmentId,
  })

  if (!ownerId || fileIds.length === 0) {
    return data
  }

  const stolen = await req.payload.find({
    collection: 'submission-files',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [{ id: { in: fileIds } }, { applicant: { not_equals: ownerId } }],
    },
  })

  if (stolen.docs.length > 0) {
    throw new APIError('You can only attach your own files.', 403)
  }

  return data
}

function requiredText(data: Record<string, unknown> | undefined, field: string, label: string) {
  if (!data?.[field] || !String(data[field]).trim()) {
    throw new Error(`${label} is required.`)
  }
}

function assertSubmitReady(data: Record<string, unknown> | undefined) {
  requiredText(data, 'fullName', 'Full Name')
  requiredText(data, 'dateOfBirth', 'Date of birth')
  requiredText(data, 'addressLine1', 'Address Line 1')
  requiredText(data, 'city', 'City')
  requiredText(data, 'state', 'State')
  requiredText(data, 'postalCode', 'Postal/Zip Code')
  requiredText(data, 'country', 'Country')
  requiredText(data, 'phone', 'Phone')
  requiredText(data, 'email', 'Email')
  requiredText(data, 'yearsOfPractice', 'Years of Practice')
  requiredText(data, 'trainingBackground', 'Educational/Training Background')
  requiredText(data, 'primaryCraftDiscipline', 'Primary Craft Discipline')
  if (data?.usCitizenOrResident !== 'yes' && data?.usCitizenOrResident !== 'no') {
    throw new Error('United States citizen or resident is required.')
  }
  requiredText(data, 'educationalBackground', 'Educational Background')
  requiredText(data, 'biographicalSummary', 'Biographical Summary')
  requiredText(data, 'workTitle', 'Work Title')
  requiredText(data, 'workYearCreated', 'Year Created')
  requiredText(data, 'workDimensions', 'Dimensions')
  requiredText(data, 'workMaterials', 'Materials')
  requiredText(data, 'artistStatement', 'Statement of practice')
  requiredText(data, 'workDescription', 'Description of submitted work')
  requiredText(data, 'workSignificance', 'Significance')
  requiredText(data, 'whyPrize', 'Why the Spector Craft Prize')

  const images = data?.workImages
  if (!Array.isArray(images) || images.length < 1) {
    throw new Error('At least one work image is required.')
  }

  if (!data.governmentId) {
    throw new Error('Government ID is required to submit.')
  }

  const declarations = data.declarationsAccepted
  if (!Array.isArray(declarations) || declarations.length < 1) {
    throw new Error('All declarations must be accepted before submitting.')
  }

  for (const entry of declarations) {
    if (!entry || typeof entry !== 'object' || !('accepted' in entry) || !entry.accepted) {
      throw new Error('All declarations must be accepted before submitting.')
    }
  }
}

export const lockSubmittedApplications: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update' || isAdmin(req.user)) {
    return data
  }

  if (originalDoc?.status === 'submitted') {
    throw new Error('Submitted applications cannot be edited.')
  }

  if (data?.status === 'submitted' && originalDoc?.status === 'draft') {
    assertSubmitReady({ ...originalDoc, ...data })
    return {
      ...data,
      submittedAt: new Date().toISOString(),
    }
  }

  return data
}

export const validateApplicationWordLimits: CollectionBeforeValidateHook = ({ data }) => {
  const limits: Array<[unknown, number]> = [
    [data?.biographicalSummary, BIO_SUMMARY_MAX_WORDS],
    [data?.artistStatement, ARTIST_STATEMENT_MAX_WORDS],
    [data?.workDescription, WORK_DESCRIPTION_MAX_WORDS],
    [data?.workSignificance, WORK_SIGNIFICANCE_MAX_WORDS],
    [data?.whyPrize, WHY_PRIZE_MAX_WORDS],
  ]

  for (const [value, maxWords] of limits) {
    const error = wordCountError(typeof value === 'string' ? value : undefined, maxWords)
    if (error !== true) {
      throw new Error(error)
    }
  }

  for (const images of [data?.workImages, data?.portfolioImages]) {
    if (!Array.isArray(images)) {
      continue
    }

    for (const entry of images) {
      const detailsError = wordCountError(entry?.additionalDetails, ADDITIONAL_DETAILS_MAX_WORDS)
      if (detailsError !== true) {
        throw new Error(detailsError)
      }
    }
  }

  return data
}

type ApplicationFileDoc = {
  id: number | string
  applicant?: unknown
  workImages?: { file?: unknown }[] | null
  portfolioImages?: { file?: unknown }[] | null
  workVideo?: unknown
  governmentId?: unknown
}

export async function syncApplicationFileLinks(
  payload: Payload,
  doc: ApplicationFileDoc,
  req?: PayloadRequest,
) {
  const fileIds = applicationFileIds(doc, { includeIdentity: false })
  const applicationId = typeof doc.id === 'number' ? doc.id : Number(doc.id)
  const applicantId = relationId(doc.applicant)

  if (fileIds.length > 0) {
    await payload.update({
      collection: 'submission-files',
      data: { application: applicationId },
      overrideAccess: true,
      req,
      where: {
        and: [
          {
            id: {
              in: fileIds,
            },
          },
          ...(applicantId ? [{ applicant: { equals: applicantId } }] : []),
        ],
      },
    })
  }

  await payload.update({
    collection: 'submission-files',
    data: { application: null },
    overrideAccess: true,
    req,
    where: {
      and: [
        {
          application: {
            equals: applicationId,
          },
        },
        ...(fileIds.length > 0
          ? [
              {
                id: {
                  not_in: fileIds,
                },
              },
            ]
          : []),
      ],
    },
  })
}

export const linkSubmissionFilesToApplication: CollectionAfterChangeHook = async ({ doc, req }) => {
  await syncApplicationFileLinks(req.payload, doc, req)
  return doc
}

export async function backfillApplicationFileLinks(payload: Payload) {
  const result = await payload.find({
    collection: 'applications',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
  })

  for (const doc of result.docs) {
    if (applicationFileIds(doc).length === 0) {
      continue
    }

    await syncApplicationFileLinks(payload, doc)
  }
}

export const sendSubmissionConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (operation !== 'update' || doc.status !== 'submitted' || previousDoc?.status === 'submitted') {
    return doc
  }

  const programId = typeof doc.program === 'object' ? doc.program?.id : doc.program
  if (!programId) {
    return doc
  }

  const program = await req.payload.findByID({
    collection: 'programs',
    id: programId,
  })

  const applicantId = typeof doc.applicant === 'object' ? doc.applicant?.id : doc.applicant
  if (!applicantId) {
    return doc
  }

  const applicant = await req.payload.findByID({
    collection: 'applicants',
    id: applicantId,
  })

  if (!applicant.email) {
    return doc
  }

  await req.payload.sendEmail({
    to: applicant.email,
    subject: `${program.name} — application received`,
    html: `<p>${program.confirmationEmailBody}</p>`,
  })

  return doc
}
