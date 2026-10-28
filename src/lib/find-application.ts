import type { Application, User } from '@/payload-types'

import { applicationPathKey, applicationPersonKey, programPublicCode } from '@/lib/portal'
import { getPayloadClient } from '@/lib/payload'

export async function findApplicationByPathKey(
  key: string,
  viewer: User,
  depth = 1,
): Promise<Application | null> {
  const payload = await getPayloadClient()
  const user = { ...viewer, collection: 'users' as const }
  const normalized = key.trim().toLowerCase()

  if (/^\d+$/.test(normalized)) {
    try {
      return await payload.findByID({
        collection: 'applications',
        id: Number(normalized),
        depth,
        user,
        overrideAccess: false,
      })
    } catch {
      return null
    }
  }

  const found = await payload.find({
    collection: 'applications',
    where: { slug: { equals: normalized } },
    depth,
    limit: 1,
    user,
    overrideAccess: false,
  })
  if (found.docs[0]) {
    return found.docs[0]
  }

  const all = await payload.find({
    collection: 'applications',
    depth,
    limit: 200,
    user,
    overrideAccess: false,
  })

  const matches = all.docs.filter(
    (doc) => applicationPathKey(doc) === normalized || applicationPersonKey(doc) === normalized,
  )
  return matches.length === 1 ? matches[0] : null
}

/** Jury and staff detail: `/scp26/naz-sahin` is the program plus the person. */
export async function findApplicationByProgramSegment(
  programCode: string,
  segment: string,
  viewer: User,
  depth = 1,
): Promise<Application | null> {
  const payload = await getPayloadClient()
  const user = { ...viewer, collection: 'users' as const }
  const code = programCode.trim().toLowerCase()
  const person = segment.trim().toLowerCase()

  if (/^\d+$/.test(person)) {
    try {
      return await payload.findByID({
        collection: 'applications',
        id: Number(person),
        depth,
        user,
        overrideAccess: false,
      })
    } catch {
      return null
    }
  }

  const exact = await payload.find({
    collection: 'applications',
    where: { slug: { equals: `${code}-${person}` } },
    depth,
    limit: 1,
    user,
    overrideAccess: false,
  })
  if (exact.docs[0]) {
    return exact.docs[0]
  }

  const legacy = await payload.find({
    collection: 'applications',
    where: { slug: { equals: person } },
    depth,
    limit: 10,
    user,
    overrideAccess: false,
  })
  const legacyMatch = legacy.docs.find((doc) => programPublicCode(doc.program) === code)
  if (legacyMatch) {
    return legacyMatch
  }

  const all = await payload.find({
    collection: 'applications',
    depth,
    limit: 200,
    user,
    overrideAccess: false,
  })
  const inProgram = all.docs.filter(
    (doc) => programPublicCode(doc.program) === code && applicationPersonKey(doc) === person,
  )
  if (inProgram[0] && inProgram.length === 1) {
    return inProgram[0]
  }

  const anywhere = all.docs.filter((doc) => applicationPersonKey(doc) === person)
  return anywhere.length === 1 ? anywhere[0] : null
}
