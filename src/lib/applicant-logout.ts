'use server'

import { cookies, headers } from 'next/headers'
import { createLocalReq, getPayload, JWTAuthentication, logoutOperation } from 'payload'

import config from '@payload-config'

export async function logoutApplicant() {
  const payload = await getPayload({ config })
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('DisableAutologin', 'true')

  try {
    const { user } = await JWTAuthentication({
      headers: requestHeaders,
      payload,
    })

    const collectionSlug = user?.collection
    const collection =
      collectionSlug === 'applicants' || collectionSlug === 'users'
        ? payload.collections[collectionSlug]
        : undefined

    if (user && collection) {
      const req = await createLocalReq({ user }, payload)
      await logoutOperation({
        collection,
        req,
      })
    }
  } catch {
    // Still remove the browser session below.
  }

  const cookieStore = await cookies()
  cookieStore.set(`${payload.config.cookiePrefix}-token`, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
