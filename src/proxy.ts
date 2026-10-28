import { NextResponse, type NextRequest } from 'next/server'

import { resolveAdminSegments } from '@/lib/admin-document-path'

const DOCUMENT_PATH =
  /^\/admin\/collections\/(applications|applicants|evaluations|programs)(\/trash)?\/([^/]+)(\/.*)?$/

export async function proxy(request: NextRequest) {
  const match = DOCUMENT_PATH.exec(request.nextUrl.pathname)
  if (!match || match[3] === 'create') {
    return NextResponse.next()
  }

  try {
    const segments = request.nextUrl.pathname.replace(/^\/admin\//, '').split('/').filter(Boolean)
    const resolved = await resolveAdminSegments(segments)
    if (!resolved.redirectPath) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = resolved.redirectPath
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/admin/collections/applications/:path*',
    '/admin/collections/applicants/:path*',
    '/admin/collections/evaluations/:path*',
    '/admin/collections/programs/:path*',
  ],
}
