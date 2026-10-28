'use client'

import { usePathname } from 'next/navigation'

import { isAdmin } from '@/access/roles'
import { PORTAL_PATHS } from '@/lib/portal'
import type { User } from '@/payload-types'

import { Actions, TextLink } from './ui'

type StaffNavProps = {
  user: User
}

const STAFF_SECTIONS = new Set(['programs', 'users', 'evaluation', 'login'])

function applicationsNavActive(pathname: string | null): boolean {
  if (!pathname) {
    return false
  }
  if (
    pathname === PORTAL_PATHS.staffApplicants ||
    pathname.startsWith(`${PORTAL_PATHS.staffApplicants}/`)
  ) {
    return true
  }

  const parts = pathname.split('/').filter(Boolean)
  return parts[0] === 'staff' && parts.length >= 3 && !STAFF_SECTIONS.has(parts[1] ?? '')
}

export function StaffNav({ user }: StaffNavProps) {
  const pathname = usePathname()

  return (
    <Actions aria-label="Staff" as="nav">
      <TextLink active={pathname === PORTAL_PATHS.staff} href={PORTAL_PATHS.staff}>
        Dashboard
      </TextLink>
      <TextLink active={pathname === PORTAL_PATHS.staffPrograms} href={PORTAL_PATHS.staffPrograms}>
        Programs
      </TextLink>
      <TextLink
        active={applicationsNavActive(pathname)}
        href={PORTAL_PATHS.staffApplicants}
      >
        Applications
      </TextLink>
      {isAdmin(user) ? (
        <>
          <TextLink active={pathname === PORTAL_PATHS.staffUsers} href={PORTAL_PATHS.staffUsers}>
            Users
          </TextLink>
          <TextLink
            active={pathname === PORTAL_PATHS.staffEvaluation}
            href={PORTAL_PATHS.staffEvaluation}
          >
            Evaluation
          </TextLink>
        </>
      ) : null}
    </Actions>
  )
}
