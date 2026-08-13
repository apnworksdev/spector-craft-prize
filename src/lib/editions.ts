const EDITION_SLUG = /^(\d{4})-prize-recipients$/

export function editionPath(year: number) {
  return `/${year}-prize-recipients`
}

export function parseEditionSlug(slug: string): number | null {
  const match = slug.match(EDITION_SLUG)
  return match ? Number(match[1]) : null
}

export function recipientPath(year: number, recipientSlug: string) {
  return `${editionPath(year)}/${recipientSlug}`
}
