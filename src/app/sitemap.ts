import type { MetadataRoute } from 'next'

import { listEditions, listRecipients } from '@/lib/cms'
import { editionPath, recipientPath } from '@/lib/editions'
import { getServerURL } from '@/lib/env'

const STATIC_PATHS = [
  '/',
  '/about',
  '/press',
  '/emerging-artists-prize',
  '/summit',
  '/terms',
  '/privacy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getServerURL()
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  try {
    const [editions, recipients] = await Promise.all([listEditions(), listRecipients()])

    const editionEntries = editions.docs.map((edition) => ({
      url: `${base}${editionPath(edition.year)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    const recipientEntries = recipients.docs.flatMap((recipient) => {
      const edition = recipient.edition
      if (typeof edition !== 'object' || !edition?.year) {
        return []
      }

      return [
        {
          url: `${base}${recipientPath(edition.year, recipient.slug)}`,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        },
      ]
    })

    return [...staticEntries, ...editionEntries, ...recipientEntries]
  } catch {
    return staticEntries
  }
}
