'use server'

import { cookies, headers } from 'next/headers'
import { createLocalReq, getPayload, logoutOperation } from 'payload'

import config from '@payload-config'

export async function clearSharedAuthCookie() {
  try {
    const payload = await getPayload({ config })
    const requestHeaders = await headers()

    try {
      const { user } = await payload.auth({ headers: requestHeaders })
      const collection = user?.collection ? payload.collections[user.collection] : undefined

      if (user && collection) {
        const req = await createLocalReq({ user }, payload)
        await logoutOperation({ collection, req })
      }
    } catch {
      // Clear the shared cookie even if the session lookup fails.
    }

    const cookieStore = await cookies()
    cookieStore.set(`${payload.config.cookiePrefix}-token`, '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  } catch {
    // The browser still leaves the admin login route.
  }
}
