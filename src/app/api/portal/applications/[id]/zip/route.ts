import { NextResponse } from 'next/server'

import {
  buildApplicationZip,
  canDownloadApplication,
  loadApplicationForDownload,
} from '@/lib/application-download'
import { getStaffSession } from '@/lib/portal-auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getStaffSession()
  if (!user || !canDownloadApplication(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const application = await loadApplicationForDownload(Number(id), user).catch(() => null)
  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const zip = await buildApplicationZip(application, user, request.headers.get('cookie') ?? '')

  return new NextResponse(Buffer.from(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="application-${application.id}.zip"`,
    },
  })
}
