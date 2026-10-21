import { getPayloadClient } from '@/lib/payload'
import { relationId } from '@/lib/portal'
import { programAcceptsSubmissions } from '@/lib/program-deadline'
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

export async function getAnyProgram(): Promise<Program | null> {
  const live = await getLiveProgram()
  if (live) {
    return live
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'programs',
    sort: '-updatedAt',
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

async function findLatestApplicantApplication(applicantId: number) {
  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'applications',
    where: { applicant: { equals: applicantId } },
    sort: '-updatedAt',
    limit: 1,
    depth: 1,
  })

  return existing.docs[0] ?? null
}

function programFromApplication(application: Application): Program | null {
  return typeof application.program === 'object' && application.program ? application.program : null
}

/** Live program when open; otherwise the applicant's existing application + its program (for review after close). */
export async function resolveApplicantPortal(applicantId: number): Promise<{
  program: Program | null
  application: Application | null
}> {
  const live = await getLiveProgram()
  if (live?.id) {
    if (programAcceptsSubmissions(live)) {
      return {
        program: live,
        application: await ensureApplicantApplication(applicantId, live.id),
      }
    }

    return {
      program: live,
      application: await findApplicantApplication(applicantId, live.id),
    }
  }

  const application = await findLatestApplicantApplication(applicantId)
  if (!application) {
    return { program: null, application: null }
  }

  return {
    program: programFromApplication(application),
    application,
  }
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
