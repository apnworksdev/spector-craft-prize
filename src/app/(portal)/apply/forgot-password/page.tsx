import { PortalShell } from '@/components/Portal/PortalShell'
import { AuthForms } from '@/components/Portal/AuthForms'
import { PORTAL_PATHS } from '@/lib/portal'

export default function ForgotPasswordPage() {
  return (
    <PortalShell>
      <AuthForms collection="applicants" mode="forgot" redirectTo={PORTAL_PATHS.login} />
    </PortalShell>
  )
}
