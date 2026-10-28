import { NextResponse, type NextRequest } from 'next/server'

const DOCUMENT_PATH =
  /^\/admin\/collections\/(applications|applicants|evaluations|programs)(\/trash)?\/([^/]+)(\/.*)?$/

export async function proxy(request: NextRequest) {
  const match = DOCUMENT_PATH.exec(request.nextUrl.pathname)
  if (!match || match[3] === 'create') {
    return NextResponse.next()
  }

  try {
    const segments = request.nextUrl.pathname.replace(/^\/admin\//, '').split('/').filter(Boolean)
    // Keep Payload out of this file. Its config imports sharp, which Netlify cannot load in middleware.
    const lookup = request.nextUrl.clone()
    lookup.pathname = '/api/admin-document-path'
    lookup.search = ''
    const response = await fetch(lookup, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-internal-secret': process.env.PAYLOAD_SECRET ?? '',
      },
      body: JSON.stringify({ segments }),
    })
    if (!response.ok) {
      return NextResponse.next()
    }

    const body = (await response.json()) as { redirectPath?: string | null }
    if (!body.redirectPath) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = body.redirectPath
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
