import type { CollectionBeforeChangeHook, CollectionBeforeDeleteHook, Payload } from 'payload'

import { publicSlug, uniquePublicSlug } from '@/lib/public-slug'

function textValue(
  data: Record<string, unknown> | undefined,
  originalDoc: Record<string, unknown> | undefined,
  key: string,
): string {
  const next = data?.[key]
  if (typeof next === 'string' && next.trim()) {
    return next.trim()
  }
  const previous = originalDoc?.[key]
  return typeof previous === 'string' ? previous.trim() : ''
}

export const syncApplicantIdentity: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) {
    return data
  }

  const record = data as Record<string, unknown>
  const previous = originalDoc as Record<string, unknown> | undefined
  const listTitle =
    [textValue(record, previous, 'firstName'), textValue(record, previous, 'lastName')]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    textValue(record, previous, 'email') ||
    'Applicant'
  const base = publicSlug(listTitle)
  const current = typeof previous?.slug === 'string' ? previous.slug.trim().toLowerCase() : ''
  const slug = current || (await uniquePublicSlug(req.payload, 'applicants', base, originalDoc?.id))

  return {
    ...data,
    listTitle,
    slug,
  }
}

export async function backfillApplicantIdentities(payload: Payload) {
  try {
    const result = await payload.find({
      collection: 'applicants',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
    })

    for (const doc of result.docs) {
      const listTitle =
        [doc.firstName, doc.lastName].filter((part) => part?.trim()).join(' ').trim() ||
        doc.email ||
        'Applicant'
      if (doc.listTitle === listTitle && doc.slug?.trim()) {
        continue
      }

      await payload.update({
        collection: 'applicants',
        id: doc.id,
        data: { listTitle },
        overrideAccess: true,
      })
    }
  } catch (error) {
    payload.logger.warn({
      err: error,
      msg: 'Skipped applicant identity backfill',
    })
  }
}

export const deleteApplicantDependents: CollectionBeforeDeleteHook = async ({ id, req }) => {
  await req.payload.delete({
    collection: 'applications',
    overrideAccess: true,
    overrideLock: true,
    req,
    where: {
      applicant: {
        equals: id,
      },
    },
  })

  await req.payload.delete({
    collection: 'submission-files',
    overrideAccess: true,
    overrideLock: true,
    req,
    where: {
      applicant: {
        equals: id,
      },
    },
  })
}
