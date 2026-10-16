import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, Text, TextLink, Title } from '@/components/Portal/ui'
import { getServerURL } from '@/lib/env'
import { PORTAL_PATHS } from '@/lib/portal'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  const verified = Boolean(token)
  let message = 'Missing verification token.'
  let ok = false

  if (token) {
    const response = await fetch(`${getServerURL()}/api/applicants/verify/${token}`, {
      method: 'POST',
      cache: 'no-store',
    })

    ok = response.ok
    message = response.ok
      ? 'Your email is verified. You can log in now.'
      : 'This verification link is invalid or expired.'
  }

  return (
    <PortalShell>
      <Panel>
        <Title>Verify email</Title>
        <Text variant={ok ? 'success' : verified ? 'error' : 'lead'}>{message}</Text>
        <TextLink href={PORTAL_PATHS.login}>Back to login</TextLink>
      </Panel>
    </PortalShell>
  )
}
