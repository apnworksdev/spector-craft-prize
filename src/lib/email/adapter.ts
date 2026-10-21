import { resendAdapter } from '@payloadcms/email-resend'

import { portalConsoleEmailAdapter } from '@/lib/email/consoleAdapter'

const DEFAULT_FROM_NAME = 'Spector Craft Prize'

export function portalEmailAdapter() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim()

  if (apiKey && fromAddress) {
    return resendAdapter({
      apiKey,
      defaultFromAddress: fromAddress,
      defaultFromName: process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME,
    })
  }

  return portalConsoleEmailAdapter
}
