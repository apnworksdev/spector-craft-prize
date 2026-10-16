import { PortalShell } from '@/components/Portal/PortalShell'
import { AuthForms } from '@/components/Portal/AuthForms'
import { PORTAL_PATHS } from '@/lib/portal'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams

  return (
    <PortalShell>
      <AuthForms
        collection="applicants"
        mode="reset"
        redirectTo={PORTAL_PATHS.login}
        resetToken={token}
      />
    </PortalShell>
  )
}
