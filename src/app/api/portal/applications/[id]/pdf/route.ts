import { NextResponse } from 'next/server'

import { buildApplicationPdf, canDownloadApplication, loadApplicationForDownload } from '@/lib/application-download'
import { getStaffSession } from '@/lib/portal-auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getStaffSession()
  if (!user || !canDownloadApplication(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  const application = await loadApplicationForDownload(Number(id), user).catch(() => null)
  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const pdf = await buildApplicationPdf(application)

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="application-${application.id}.pdf"`,
    },
  })
}
