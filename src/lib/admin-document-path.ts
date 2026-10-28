import { applicationPersonKey } from '@/lib/portal'
import { getPayloadClient } from '@/lib/payload'

const SLUG_COLLECTIONS = new Set(['applications', 'applicants', 'evaluations', 'programs'])

type AdminCollection = 'applications' | 'applicants' | 'evaluations' | 'programs'

type ResolvedSegments = {
  redirectPath?: string
  segments: string[]
}

function adminPath(segments: string[]): string {
  return `/admin/${segments.join('/')}`
}

function documentKey(collection: AdminCollection, doc: { code?: string | null; slug?: string | null }): string {
  if (collection === 'programs') {
    return typeof doc.code === 'string' ? doc.code.trim().toLowerCase() : ''
  }

  return typeof doc.slug === 'string' ? doc.slug.trim().toLowerCase() : ''
}

/**
 * Admin document URLs use a public key.
 * A numeric id, or an old name-only application slug, redirects to that key.
 * The key is resolved back to the numeric id for Payload.
 */
export async function resolveAdminSegments(segments: string[]): Promise<ResolvedSegments> {
  if (segments[0] !== 'collections' || !segments[1] || !SLUG_COLLECTIONS.has(segments[1])) {
    return { segments }
  }

  const idIndex = segments[2] === 'trash' ? 3 : 2
  const key = segments[idIndex]
  if (!key || key === 'create') {
    return { segments }
  }

  const collection = segments[1] as AdminCollection

  try {
    const payload = await getPayloadClient()

    if (/^\d+$/.test(key)) {
      const doc = await payload
        .findByID({
          collection,
          id: Number(key),
          depth: 0,
          overrideAccess: true,
        })
        .catch(() => null)
      const publicKey = doc ? documentKey(collection, doc) : ''
      if (!publicKey || publicKey === key) {
        return { segments }
      }

      const next = [...segments]
      next[idIndex] = publicKey
      return { segments, redirectPath: adminPath(next) }
    }

    if (collection === 'programs') {
      const found = await payload.find({
        collection: 'programs',
        where: {
          or: [
            { code: { equals: key.toUpperCase() } },
            { code: { equals: key } },
            { slug: { equals: key } },
          ],
        },
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
      })
      const program = found.docs[0]
      if (!program) {
        return { segments }
      }

      const next = [...segments]
      next[idIndex] = String(program.id)
      const publicKey = documentKey('programs', program)
      if (!publicKey || publicKey === key.toLowerCase()) {
        return { segments: next }
      }

      const redirectSegments = [...segments]
      redirectSegments[idIndex] = publicKey
      return { segments: next, redirectPath: adminPath(redirectSegments) }
    }

    const found = await payload.find({
      collection,
      where: { slug: { equals: key } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    })
    const id = found.docs[0]?.id
    if (id != null) {
      const next = [...segments]
      next[idIndex] = String(id)
      return { segments: next }
    }

    if (collection === 'applications') {
      const all = await payload.find({
        collection: 'applications',
        depth: 1,
        limit: 200,
        overrideAccess: true,
        pagination: false,
      })
      const matches = all.docs.filter(
        (doc) => applicationPersonKey(doc) === key.toLowerCase(),
      )
      const match = matches.length === 1 ? matches[0] : null
      const slug = match?.slug?.trim().toLowerCase() ?? ''
      if (match && slug && slug !== key.toLowerCase()) {
        const next = [...segments]
        next[idIndex] = String(match.id)
        const redirectSegments = [...segments]
        redirectSegments[idIndex] = slug
        return { segments: next, redirectPath: adminPath(redirectSegments) }
      }
    }

    return { segments }
  } catch {
    return { segments }
  }
}
