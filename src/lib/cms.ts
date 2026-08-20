import { unstable_cache } from 'next/cache'

import { tagsForEdition, tagsForGlobal, tagsForRecipient, type GlobalSlug } from '@/lib/cache-tags'
import { getPayloadClient } from '@/lib/payload'

export function getCachedGlobal<T extends GlobalSlug>(slug: T, depth = 0) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      return payload.findGlobal({ slug, depth })
    },
    ['cms', 'global', slug, String(depth)],
    { tags: tagsForGlobal(slug) },
  )()
}

export function getCachedEdition(year: number) {
  return unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'editions',
        depth: 2,
        where: {
          year: {
            equals: year,
          },
        },
        limit: 1,
      })

      return result.docs[0] ?? null
    },
    ['cms', 'edition', String(year)],
    { tags: tagsForEdition(year) },
  )()
}

export function getCachedRecipient(year: number, recipientSlug: string) {
  return unstable_cache(
    async () => {
      const edition = await getCachedEdition(year)

      if (!edition) {
        return null
      }

      const payload = await getPayloadClient()
      const recipients = await payload.find({
        collection: 'prize-recipients',
        depth: 2,
        where: {
          and: [
            {
              edition: {
                equals: edition.id,
              },
            },
            {
              slug: {
                equals: recipientSlug,
              },
            },
          ],
        },
        limit: 1,
      })

      return recipients.docs[0] ?? null
    },
    ['cms', 'recipient', String(year), recipientSlug],
    { tags: tagsForRecipient(year, recipientSlug) },
  )()
}

export async function listEditions() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'editions',
    limit: 100,
    sort: '-year',
  })
}

export async function listRecipients() {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'prize-recipients',
    depth: 1,
    limit: 200,
    sort: 'slug',
  })
}
