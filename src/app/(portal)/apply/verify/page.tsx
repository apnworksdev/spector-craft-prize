import { PortalShell } from '@/components/Portal/PortalShell'
import { Panel, Text, TextLink, Title } from '@/components/Portal/ui'
import { getPayloadClient } from '@/lib/payload'
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
    try {
      const payload = await getPayloadClient()
      ok = await payload.verifyEmail({
        collection: 'applicants',
        token,
      })
      message = ok
        ? 'Your email is verified. You can log in now.'
        : 'This verification link is invalid or expired.'
    } catch {
      ok = false
      message = 'This verification link is invalid or expired.'
    }
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
