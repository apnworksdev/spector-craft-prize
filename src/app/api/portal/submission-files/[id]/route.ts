import { NextResponse } from 'next/server'

import { canAccessJuryView, isAdmin } from '@/access/roles'
import { getPayloadClient } from '@/lib/payload'
import { relationId } from '@/lib/portal'
import { getApplicantSession, getStaffSession } from '@/lib/portal-auth'
import { readSubmissionFileBytes } from '@/lib/submission-file-bytes'
import type { Applicant, SubmissionFile, User } from '@/payload-types'

type RouteContext = {
  params: Promise<{ id: string }>
}

async function canStaffReadFile(user: User, file: SubmissionFile): Promise<boolean> {
  if (isAdmin({ ...user, collection: 'users' })) {
    return true
  }

  if (!canAccessJuryView({ ...user, collection: 'users' }) || file.kind === 'id') {
    return false
  }

  const applicationId = relationId(file.application)
  if (!applicationId) {
    return false
  }

  const payload = await getPayloadClient()
  try {
    const application = await payload.findByID({
      collection: 'applications',
      id: applicationId,
      depth: 0,
      user: { ...user, collection: 'users' },
      overrideAccess: false,
    })
    return application.status === 'submitted'
  } catch {
    return false
  }
}

function canApplicantReadFile(user: Applicant, file: SubmissionFile): boolean {
  return relationId(file.applicant) === relationId(user.id)
}

export async function GET(request: Request, context: RouteContext) {
  const { id: rawId } = await context.params
  const id = Number(rawId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const staff = await getStaffSession()
  const applicant = staff ? null : await getApplicantSession()
  if (!staff && !applicant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  let file: SubmissionFile
  try {
    file = await payload.findByID({
      collection: 'submission-files',
      id,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const allowed = staff
    ? await canStaffReadFile(staff, file)
    : Boolean(applicant && canApplicantReadFile(applicant, file))

  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const bytes = await readSubmissionFileBytes(file, request.headers.get('cookie') ?? '')
  if (!bytes) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const headers = new Headers({
    'Content-Type': file.mimeType || 'application/octet-stream',
    'Cache-Control': 'private, max-age=300',
  })
  if (file.filename) {
    headers.set(
      'Content-Disposition',
      `inline; filename="${file.filename.replace(/"/g, '')}"`,
    )
  }

  return new NextResponse(new Uint8Array(bytes), { headers })
}
