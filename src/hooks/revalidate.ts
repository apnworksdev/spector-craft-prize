import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'

import { CMS_TAGS, tagsForEdition, tagsForGlobal, tagsForRecipient } from '@/lib/cache-tags'

async function expireTags(tags: string[]) {
  try {
    const { revalidateTag } = await import('next/cache')

    for (const tag of tags) {
      revalidateTag(tag, 'max')
    }
  } catch {
    // Payload CLI (migrate, generate:types) has no Next.js cache.
  }
}

async function yearFromEdition(payload: Payload, edition: unknown): Promise<number | null> {
  if (typeof edition === 'object' && edition && 'year' in edition && typeof edition.year === 'number') {
    return edition.year
  }

  if (typeof edition !== 'number') {
    return null
  }

  const doc = await payload.findByID({
    collection: 'editions',
    id: edition,
    depth: 0,
  })

  return doc.year
}

export function revalidateGlobal(slug: Parameters<typeof tagsForGlobal>[0]): GlobalAfterChangeHook {
  return async () => {
    await expireTags(tagsForGlobal(slug))
  }
}

export const revalidateEdition: CollectionAfterChangeHook = async ({ doc }) => {
  await expireTags(tagsForEdition(doc.year as number))
}

export const revalidateDeletedEdition: CollectionAfterDeleteHook = async ({ doc }) => {
  await expireTags(tagsForEdition(doc.year as number))
}

export const revalidateRecipient: CollectionAfterChangeHook = async ({ doc, req }) => {
  const year = await yearFromEdition(req.payload, doc.edition)

  if (!year || typeof doc.slug !== 'string') {
    return
  }

  await expireTags(tagsForRecipient(year, doc.slug))
}

export const revalidateDeletedRecipient: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const year = await yearFromEdition(req.payload, doc.edition)

  if (!year || typeof doc.slug !== 'string') {
    return
  }

  await expireTags(tagsForRecipient(year, doc.slug))
}

export const revalidateMedia: CollectionAfterChangeHook = async () => {
  await expireTags([CMS_TAGS.media])
}

export const revalidateDeletedMedia: CollectionAfterDeleteHook = async () => {
  await expireTags([CMS_TAGS.media])
}
