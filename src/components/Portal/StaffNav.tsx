'use client'

import { usePathname } from 'next/navigation'

import { isAdmin } from '@/access/roles'
import { PORTAL_PATHS } from '@/lib/portal'
import type { User } from '@/payload-types'

import { Actions, TextLink } from './ui'

type StaffNavProps = {
  user: User
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
        active={pathname?.startsWith(PORTAL_PATHS.staffApplicants)}
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
