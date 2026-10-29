import { NextResponse } from 'next/server'

import { isAdmin } from '@/access/roles'
import { evaluationsToCsv } from '@/lib/evaluations-csv'
import { getPayloadClient } from '@/lib/payload'
import { contentDispositionAttachment } from '@/lib/portal'
import { getStaffSession } from '@/lib/portal-auth'

export async function GET() {
  const user = await getStaffSession()
  const adminUser = user ? { ...user, collection: 'users' as const } : null
  if (!adminUser || !isAdmin(adminUser)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'evaluations',
    depth: 1,
    limit: 1000,
    sort: '-updatedAt',
    overrideAccess: false,
    user: adminUser,
  })

  const csv = evaluationsToCsv(result.docs)
  const stamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': contentDispositionAttachment(`jury-scores-${stamp}.csv`),
    },
  })
}
