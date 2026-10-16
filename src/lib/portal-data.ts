import { getPayloadClient } from '@/lib/payload'
import { relationId } from '@/lib/portal'
import type { Application, Program } from '@/payload-types'

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'programs',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] ?? null
}

export async function getLiveProgram(): Promise<Program | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'programs',
    where: { status: { equals: 'live' } },
    limit: 1,
    depth: 1,
  })

  return result.docs[0] ?? null
}

async function findApplicantApplication(applicantId: number, programId: number) {
  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'applications',
    where: {
      and: [{ applicant: { equals: applicantId } }, { program: { equals: programId } }],
    },
    limit: 1,
    depth: 1,
  })

  return existing.docs[0] ?? null
}

export async function ensureApplicantApplication(
  applicantId: number,
  programId: number,
): Promise<Application> {
  const existing = await findApplicantApplication(applicantId, programId)
  if (existing) {
    return existing
  }

  const payload = await getPayloadClient()

  try {
    return await payload.create({
      collection: 'applications',
      data: {
        applicant: applicantId,
        program: programId,
        status: 'draft',
      },
      depth: 1,
    })
  } catch (error) {
    const createdByParallelRequest = await findApplicantApplication(applicantId, programId)
    if (createdByParallelRequest) {
      return createdByParallelRequest
    }

    throw error
  }
}

export function isApplicationReadOnly(application: Application): boolean {
  return application.status === 'submitted'
}

export function applicationProgramId(application: Application): number | null {
  return relationId(application.program)
}
