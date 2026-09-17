import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
  PayloadRequest,
} from 'payload'

import {
  CMS_TAGS,
  pathsForEdition,
  pathsForGlobal,
  pathsForRecipient,
  SITE_LAYOUT_PATHS,
  tagsForEdition,
  tagsForGlobal,
  tagsForRecipient,
  type RevalidateTarget,
} from '@/lib/cache-tags'

async function commitOpenTransaction(req: PayloadRequest) {
  const transactionID = await req.transactionID

  if (!transactionID) {
    return
  }

  await req.payload.db.commitTransaction(transactionID)
  delete req.transactionID
}

async function expireCache(tags: string[], paths: RevalidateTarget[]) {
  const { revalidatePath, revalidateTag } = await import('next/cache')

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  for (const target of paths) {
    if (target.type) {
      revalidatePath(target.path, target.type)
    } else {
      revalidatePath(target.path)
    }
  }
}

async function persistThenRevalidate(req: PayloadRequest, tags: string[], paths: RevalidateTarget[]) {
  try {
    await commitOpenTransaction(req)
  } catch (error) {
    req.payload.logger.error({ err: error }, 'Failed to commit before CMS revalidation')
  }

  try {
    await expireCache(tags, paths)
    req.payload.logger.info(
      { paths: paths.map((target) => target.path), tags },
      'Revalidated CMS cache',
    )
  } catch (error) {
    req.payload.logger.error({ err: error, paths, tags }, 'Failed to revalidate CMS cache')
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
  return async ({ req }) => {
    await persistThenRevalidate(req, tagsForGlobal(slug), pathsForGlobal(slug))
  }
}

export const revalidateEdition: CollectionAfterChangeHook = async ({ doc, req }) => {
  const year = doc.year as number
  await persistThenRevalidate(req, tagsForEdition(year), pathsForEdition(year))
}

export const revalidateDeletedEdition: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const year = doc.year as number
  await persistThenRevalidate(req, tagsForEdition(year), pathsForEdition(year))
}

export const revalidateRecipient: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const [tags, paths] = await cacheForRecipient(req.payload, doc, previousDoc)
  await persistThenRevalidate(req, tags, paths)
}

export const revalidateDeletedRecipient: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const [tags, paths] = await cacheForRecipient(req.payload, doc)
  await persistThenRevalidate(req, tags, paths)
}

export const revalidateMedia: CollectionAfterChangeHook = async ({ req }) => {
  await persistThenRevalidate(req, [CMS_TAGS.media], SITE_LAYOUT_PATHS)
}

export const revalidateDeletedMedia: CollectionAfterDeleteHook = async ({ req }) => {
  await persistThenRevalidate(req, [CMS_TAGS.media], SITE_LAYOUT_PATHS)
}

export const revalidateDocument: CollectionAfterChangeHook = async ({ req }) => {
  await persistThenRevalidate(req, [CMS_TAGS.documents, CMS_TAGS.navigation], SITE_LAYOUT_PATHS)
}

export const revalidateDeletedDocument: CollectionAfterDeleteHook = async ({ req }) => {
  await persistThenRevalidate(req, [CMS_TAGS.documents, CMS_TAGS.navigation], SITE_LAYOUT_PATHS)
}

async function cacheForRecipient(
  payload: Payload,
  doc: { edition?: unknown; slug?: unknown },
  previousDoc?: { edition?: unknown; slug?: unknown },
): Promise<[string[], RevalidateTarget[]]> {
  const tags = new Set<string>()
  const paths: RevalidateTarget[] = []

  async function add(entry: { edition?: unknown; slug?: unknown } | undefined) {
    if (!entry || typeof entry.slug !== 'string') {
      return
    }

    const year = await yearFromEdition(payload, entry.edition)

    if (!year) {
      return
    }

    for (const tag of tagsForRecipient(year, entry.slug)) {
      tags.add(tag)
    }

    paths.push(...pathsForRecipient(year, entry.slug))
  }

  await add(doc)
  await add(previousDoc)

  const uniquePaths = paths.filter((target, index) => {
    const key = `${target.type ?? 'page'}:${target.path}`
    return (
      paths.findIndex((candidate) => `${candidate.type ?? 'page'}:${candidate.path}` === key) ===
      index
    )
  })

  return [[...tags], uniquePaths]
}
