import type { ReactNode } from 'react'

import { ApplicationFlow } from '@/components/Portal/ApplicationFlow'
import { PortalShell } from '@/components/Portal/PortalShell'
import { loadApplicationWizardLayout } from '@/lib/portal-application-page'

export default async function ApplicationLayout({ children }: { children: ReactNode }) {
  const { application, program, readOnly, userLabel } = await loadApplicationWizardLayout()

  return (
    <PortalShell showLogout userLabel={userLabel}>
      <ApplicationFlow application={application} program={program} readOnly={readOnly} />
      {/* Step URLs keep the layout mounted; pages are empty shells for routing only. */}
      <div hidden aria-hidden="true">
        {children}
      </div>
    </PortalShell>
  )
}
