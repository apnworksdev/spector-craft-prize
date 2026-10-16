import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { JWTAuthentication } from 'payload'
import { cache } from 'react'

import { canAccessJuryView, isAdmin, isStaffUser } from '@/access/roles'
import { getPayloadClient } from '@/lib/payload'
import { PORTAL_PATHS } from '@/lib/portal'
import type { Applicant, User } from '@/payload-types'

type PortalUser = (Applicant | User) & { collection?: string }

const SESSION_CACHE_MS = 30_000
const sessionCache = new Map<string, { at: number; user: PortalUser }>()

function readAuthToken(requestHeaders: Headers, cookiePrefix: string) {
  const cookie = requestHeaders.get('cookie') ?? ''
  const tokenName = `${cookiePrefix}-token=`
  for (const part of cookie.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(tokenName)) {
      return decodeURIComponent(trimmed.slice(tokenName.length))
    }
  }

  return ''
}

function readSessionCache(token: string, collection: 'applicants' | 'users') {
  const cached = sessionCache.get(`${collection}:${token}`)
  if (!cached || Date.now() - cached.at > SESSION_CACHE_MS) {
    return null
  }

  return cached.user
}

const SESSION_CACHE_MAX = 200

function pruneSessionCache(now = Date.now()) {
  for (const [key, cached] of sessionCache) {
    if (now - cached.at > SESSION_CACHE_MS) {
      sessionCache.delete(key)
    }
  }

  if (sessionCache.size <= SESSION_CACHE_MAX) {
    return
  }

  const extra = sessionCache.size - SESSION_CACHE_MAX
  const keys = sessionCache.keys()
  for (let i = 0; i < extra; i += 1) {
    const key = keys.next().value
    if (key) {
      sessionCache.delete(key)
    }
  }
}

function writeSessionCache(token: string, collection: 'applicants' | 'users', user: PortalUser) {
  pruneSessionCache()
  sessionCache.set(`${collection}:${token}`, { at: Date.now(), user })
}

async function fetchMe(collection: 'applicants' | 'users'): Promise<PortalUser | null> {
  const payload = await getPayloadClient()
  const requestHeaders = new Headers(await headers())
  requestHeaders.set('DisableAutologin', 'true')
  const token = readAuthToken(requestHeaders, payload.config.cookiePrefix)
  const cached = token ? readSessionCache(token, collection) : null
  if (cached) {
    return cached
  }

  const { user } = await JWTAuthentication({
    headers: requestHeaders,
    payload,
  })

  if (!user || user.collection !== collection) {
    return null
  }

  const portalUser = user as PortalUser
  if (token) {
    writeSessionCache(token, collection, portalUser)
  }

  return portalUser
}

const fetchMeCached = cache(fetchMe)

export async function getApplicantSession() {
  const user = await fetchMeCached('applicants')
  if (!user) {
    return null
  }

  return user as Applicant
}

export async function getStaffSession() {
  const user = await fetchMeCached('users')
  if (!user) {
    return null
  }

  return user as User
}

export async function requireApplicant(redirectTo = PORTAL_PATHS.login) {
  const user = await getApplicantSession()
  if (!user) {
    redirect(redirectTo)
  }

  return user
}

export async function requireAdmin() {
  const user = await getStaffSession()
  if (!user) {
    redirect(`${PORTAL_PATHS.staff}/login`)
  }

  if (!isAdmin(user)) {
    redirect(canAccessJuryView(user) ? PORTAL_PATHS.jury : `${PORTAL_PATHS.staff}/login`)
  }

  return user
}

export async function requireStaff() {
  const user = await getStaffSession()
  if (!user || !isStaffUser(user)) {
    redirect(`${PORTAL_PATHS.staff}/login`)
  }

  return user
}

export async function requireJuryAccess() {
  const user = await getStaffSession()
  if (!user || !canAccessJuryView(user)) {
    redirect(`${PORTAL_PATHS.jury}/login`)
  }

  return user
}
