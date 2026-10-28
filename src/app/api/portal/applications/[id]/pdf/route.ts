import { NextResponse } from 'next/server'

import { buildApplicationPdf, canDownloadApplication, loadApplicationForDownloadKey } from '@/lib/application-download'
import { applicationDownloadBasename, contentDispositionAttachment } from '@/lib/portal'
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
  const application = await loadApplicationForDownloadKey(id, user).catch(() => null)
  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const pdf = await buildApplicationPdf(application)
  const filename = `${applicationDownloadBasename(application)}.pdf`

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': contentDispositionAttachment(filename),
    },
  })
}
