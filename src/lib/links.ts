import { editionPath, recipientPath } from '@/lib/editions'

type InternalLinkDoc = {
  relationTo?: string
  value?: unknown
}

type LinkNodeLike = {
  fields?: {
    doc?: InternalLinkDoc | null
    url?: string | null
  }
}

export function internalDocToHref({ linkNode }: { linkNode: LinkNodeLike }): string {
  const doc = linkNode.fields?.doc
  const value = doc?.value

  if (!doc?.relationTo || !value || typeof value !== 'object') {
    return linkNode.fields?.url || '#'
  }

  if (doc.relationTo === 'editions' && 'year' in value && typeof value.year === 'number') {
    return editionPath(value.year)
  }

  if (doc.relationTo === 'prize-recipients' && 'slug' in value && typeof value.slug === 'string') {
    const edition = 'edition' in value ? value.edition : null
    const year =
      edition && typeof edition === 'object' && 'year' in edition && typeof edition.year === 'number'
        ? edition.year
        : null

    if (year) {
      return recipientPath(year, value.slug)
    }
  }

  if (doc.relationTo === 'media' && 'url' in value && typeof value.url === 'string' && value.url) {
    return value.url
  }

  return '#'
}
