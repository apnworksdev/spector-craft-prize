'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { redirect } from 'next/navigation'

import { canAccessJuryView, isAdmin } from '@/access/roles'
import { syncApplicationPanelGrade } from '@/hooks/evaluations'
import { applicationReadyToSubmit } from '@/lib/application-progress'
import {
  isValidJuryScore,
  JURY_SCORE_FIELDS,
  type JuryScoreValues,
} from '@/lib/jury-scores'
import { getApplicantSession, getStaffSession } from '@/lib/portal-auth'
import { ensureApplicantApplication, getLiveProgram } from '@/lib/portal-data'
import { getPayloadClient } from '@/lib/payload'
import { applicationStaffPath, PORTAL_PATHS } from '@/lib/portal'
import type { Application } from '@/payload-types'

const APPLICANT_BLOCKED_FIELDS = new Set([
  'id',
  'applicant',
  'program',
  'status',
  'submittedAt',
  'selectedForEvaluation',
  'panelMedian',
  'evaluationCount',
  'listTitle',
  'slug',
  'evaluations',
  'createdAt',
  'updatedAt',
])

/** Empty strings break Postgres dates/numbers; store null instead. */
function sanitizeApplicantApplicationData(data: Partial<Application>): Partial<Application> {
  const next: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (APPLICANT_BLOCKED_FIELDS.has(key)) {
      continue
    }
    if (value === '') {
      next[key] = null
      continue
    }
    next[key] = value
  }

  return next as Partial<Application>
}

function saveErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Save failed.'
  if (message.startsWith('Failed query:')) {
    return 'Could not save this step. Check the fields and try again.'
  }
  return message
}

export async function updateApplicationFields(
  applicationId: number,
  data: Partial<Application>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const applicant = await getApplicantSession()
  if (!applicant?.id) {
    return { ok: false, error: 'You must be logged in.' }
  }

  const sanitized = sanitizeApplicantApplicationData(data)
  if (Object.keys(sanitized).length === 0) {
    return { ok: true }
  }

  try {
    const payload = await getPayloadClient()
    await payload.update({
      collection: 'applications',
      id: applicationId,
      data: sanitized,
      depth: 0,
      user: { ...applicant, collection: 'applicants' },
      overrideAccess: false,
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, error: saveErrorMessage(error) }
  }
}

export async function submitApplication(applicationId: number) {
  const applicant = await getApplicantSession()
  if (!applicant?.id) {
    return { ok: false, error: 'You must be logged in.' }
  }

  const payload = await getPayloadClient()
  const application = await payload.findByID({
    collection: 'applications',
    id: applicationId,
    depth: 0,
    user: { ...applicant, collection: 'applicants' },
    overrideAccess: false,
  })

  if (!applicationReadyToSubmit(application)) {
    return { ok: false, error: 'Your application is not complete yet.' }
  }

  try {
    await payload.update({
      collection: 'applications',
      id: applicationId,
      data: { status: 'submitted' },
      user: { ...applicant, collection: 'applicants' },
      overrideAccess: false,
    })
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Submit failed.' }
  }

  return { ok: true }
}

export async function ensureApplicationForLiveProgram() {
  const applicant = await getApplicantSession()
  if (!applicant?.id) {
    return null
  }

  const program = await getLiveProgram()
  if (!program?.id) {
    return null
  }

  return ensureApplicantApplication(applicant.id, program.id)
}

export async function setProgramStatusFromForm(formData: FormData): Promise<void> {
  const programId = Number(formData.get('programId'))
  const status = String(formData.get('status') || '') as 'draft' | 'live' | 'closed'
  if (!programId || !['draft', 'live', 'closed'].includes(status)) {
    return
  }

  await setProgramStatus(programId, status)
}

export async function setProgramStatus(programId: number, status: 'draft' | 'live' | 'closed') {
  const staff = await getStaffSession()
  if (!staff || !isAdmin(staff)) {
    return { ok: false, error: 'Unauthorized' }
  }

  const payload = await getPayloadClient()
  await payload.update({
    collection: 'programs',
    id: programId,
    data: { status },
    user: { ...staff, collection: 'users' },
    overrideAccess: false,
  })

  revalidatePath(PORTAL_PATHS.staff)
  revalidatePath(PORTAL_PATHS.staffPrograms)
  revalidatePath(PORTAL_PATHS.welcome)
  return { ok: true }
}

export async function toggleEvaluationAction(applicationId: number) {
  const staff = await getStaffSession()
  if (!staff || !isAdmin(staff)) {
    return
  }

  const payload = await getPayloadClient()
  const application = await payload.findByID({
    collection: 'applications',
    id: applicationId,
    user: { ...staff, collection: 'users' },
  })

  await setSelectedForEvaluation(applicationId, !application.selectedForEvaluation)
}

export async function setSelectedForEvaluation(applicationId: number, selected: boolean) {
  const staff = await getStaffSession()
  if (!staff || !isAdmin(staff)) {
    return { ok: false, error: 'Unauthorized' }
  }

  const payload = await getPayloadClient()
  const application = await payload.findByID({
    collection: 'applications',
    id: applicationId,
    depth: 0,
    user: { ...staff, collection: 'users' },
    overrideAccess: false,
  })

  if (application.status !== 'submitted') {
    return { ok: false, error: 'Only submitted applications can be selected for evaluation.' }
  }

  await payload.update({
    collection: 'applications',
    id: applicationId,
    data: { selectedForEvaluation: selected },
    user: { ...staff, collection: 'users' },
    overrideAccess: false,
  })

  revalidatePath(applicationStaffPath(application))
  revalidatePath(PORTAL_PATHS.staffEvaluation)
  revalidatePath(PORTAL_PATHS.jury)
  return { ok: true }
}

export async function createJurorUser(formData: FormData): Promise<void> {
  const staff = await getStaffSession()
  if (!staff || !isAdmin(staff)) {
    redirect(`${PORTAL_PATHS.staff}/login`)
  }

  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const firstName = String(formData.get('firstName') || '').trim()
  const lastName = String(formData.get('lastName') || '').trim()
  let error = ''
  if (!email || !password || !firstName || !lastName) {
    error = 'All fields are required.'
  } else {
    try {
      const payload = await getPayloadClient()
      await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          firstName,
          lastName,
          role: 'juror',
          canJury: false,
        },
        user: { ...staff, collection: 'users' },
        overrideAccess: false,
      })
    } catch (createError) {
      error = createError instanceof Error ? createError.message : 'Could not create juror.'
    }
  }

  revalidatePath(PORTAL_PATHS.staffUsers)
  redirect(
    error
      ? `${PORTAL_PATHS.staffUsers}?error=${encodeURIComponent(error)}`
      : PORTAL_PATHS.staffUsers,
  )
}

export async function saveEvaluation(
  applicationId: number,
  data: JuryScoreValues & { notes?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const staff = await getStaffSession()
  if (!staff || !canAccessJuryView(staff)) {
    return { ok: false, error: 'Unauthorized' }
  }

  for (const field of JURY_SCORE_FIELDS) {
    if (!isValidJuryScore(data[field.name])) {
      return { ok: false, error: 'Each criterion needs a score from 1 to 5.' }
    }
  }

  const payload = await getPayloadClient()
  const user = { ...staff, collection: 'users' as const }

  try {
    const application = await payload.findByID({
      collection: 'applications',
      id: applicationId,
      depth: 0,
      user,
      overrideAccess: false,
    })

    if (application.status !== 'submitted') {
      return { ok: false, error: 'This application is not open for scoring.' }
    }

    if (isAdmin(staff) && !application.selectedForEvaluation) {
      return { ok: false, error: 'This application is not open for scoring.' }
    }

    const scores = {
      artisticExcellence: data.artisticExcellence,
      culturalSignificance: data.culturalSignificance,
      growthPotential: data.growthPotential,
      missionAlignment: data.missionAlignment,
      notes: data.notes?.trim() || null,
    }

    const existing = await payload.find({
      collection: 'evaluations',
      where: {
        and: [{ application: { equals: applicationId } }, { juror: { equals: staff.id } }],
      },
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
    })

    const saveContext = {
      deferPanelGrade: true,
      evaluationTargetChecked: true,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'evaluations',
        id: existing.docs[0].id,
        data: scores,
        user,
        overrideAccess: false,
        context: saveContext,
      })
    } else {
      await payload.create({
        collection: 'evaluations',
        data: {
          application: applicationId,
          juror: staff.id,
          ...scores,
        },
        user,
        overrideAccess: false,
        context: saveContext,
      })
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Could not save score.' }
  }

  revalidatePath(PORTAL_PATHS.jury, 'layout')
  after(async () => {
    try {
      await syncApplicationPanelGrade(payload, applicationId)
      revalidatePath(PORTAL_PATHS.staff, 'layout')
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Could not refresh the panel grade' })
    }
  })
  return { ok: true }
}
