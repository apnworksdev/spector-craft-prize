import type { Payload } from 'payload'

export type SlugCollection = 'applications' | 'applicants' | 'evaluations'

/** Readable URL segment. Letters, numbers already inside a name stay; the record id does not. */
export function publicSlug(value: string): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return cleaned || 'record'
}

export async function uniquePublicSlug(
  payload: Payload,
  collection: SlugCollection,
  base: string,
  currentId?: number | string | null,
): Promise<string> {
  const prepared = base.trim().toLowerCase()
  const root = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(prepared)
    ? prepared.slice(0, 160)
    : publicSlug(base) || 'record'
  let candidate = root
  let suffix = 2

  while (suffix < 50) {
    const existing = await payload.find({
      collection,
      where: { slug: { equals: candidate } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    })
    const doc = existing.docs[0]
    if (!doc || (currentId != null && String(doc.id) === String(currentId))) {
      return candidate
    }

    candidate = `${root}-${suffix}`
    suffix += 1
  }

  return `${root}-${currentId ?? 'record'}`
}
