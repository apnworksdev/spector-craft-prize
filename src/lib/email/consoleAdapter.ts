import type { EmailAdapter } from 'payload'

import { SUPPORT_EMAIL } from '@/lib/portal'

export const portalConsoleEmailAdapter: EmailAdapter<void> = ({ payload }) => ({
  name: 'portal-console',
  defaultFromAddress: SUPPORT_EMAIL,
  defaultFromName: 'Spector Craft Prize',
  sendEmail: async (message) => {
    const to = Array.isArray(message.to) ? message.to.join(', ') : message.to
    const html = typeof message.html === 'string' ? message.html : ''
    const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1])
    const line = `Email (console): to=${to ?? 'unknown'} subject=${message.subject ?? '(no subject)'}${links.length ? ` link=${links.join(' ')}` : ''}`
    payload.logger.info(line)
    console.info(line)
    return Promise.resolve()
  },
})
