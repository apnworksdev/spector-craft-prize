'use client'

import { useState } from 'react'

import { logoutApplicant } from '@/lib/applicant-logout'
import { PORTAL_PATHS } from '@/lib/portal'

import { Button } from './ui'

export function LogoutButton({ redirectTo = PORTAL_PATHS.login }: { redirectTo?: string }) {
  const [pending, setPending] = useState(false)

  return (
    <Button
      disabled={pending}
      onClick={() => {
        setPending(true)
        void logoutApplicant().finally(() => {
          window.location.assign(redirectTo)
        })
      }}
      variant="link"
    >
      Log out
    </Button>
  )
}
