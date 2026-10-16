import { relationId } from '@/lib/portal'

type ApplicationFiles = {
  workImages?: unknown[] | null
  portfolioImages?: unknown[] | null
  workVideo?: unknown
  governmentId?: unknown
}

function entryFile(entry: unknown): unknown {
  if (entry && typeof entry === 'object' && 'file' in entry) {
    return entry.file
  }

  return undefined
}

export function applicationFileIds(
  doc: ApplicationFiles,
  options?: { includeIdentity?: boolean },
): number[] {
  const ids: number[] = []
  const includeIdentity = options?.includeIdentity !== false

  for (const entry of [...(doc.workImages ?? []), ...(doc.portfolioImages ?? [])]) {
    const id = relationId(entryFile(entry))
    if (id) {
      ids.push(id)
    }
  }

  const videoId = relationId(doc.workVideo)
  if (videoId) {
    ids.push(videoId)
  }

  if (includeIdentity) {
    const identityId = relationId(doc.governmentId)
    if (identityId) {
      ids.push(identityId)
    }
  }

  return [...new Set(ids)]
}
