import { timingSafeEqual } from 'node:crypto'

import { NextResponse } from 'next/server'

import { resolveAdminSegments } from '@/lib/admin-document-path'

function authorized(request: Request) {
  const secret = process.env.PAYLOAD_SECRET
  const header = request.headers.get('x-internal-secret')
  if (!secret || !header) {
    return false
  }

  const provided = Buffer.from(header)
  const expected = Buffer.from(secret)
  if (provided.length !== expected.length) {
    return false
  }

  return timingSafeEqual(provided, expected)
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ redirectPath: null }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { segments?: unknown } | null
  const segments = Array.isArray(body?.segments)
    ? body.segments.filter((segment): segment is string => typeof segment === 'string')
    : []
  const resolved = await resolveAdminSegments(segments)

  return NextResponse.json({ redirectPath: resolved.redirectPath ?? null })
}
