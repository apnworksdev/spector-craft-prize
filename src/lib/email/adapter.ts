import { resendAdapter } from '@payloadcms/email-resend'
import type { EmailAdapter, SendEmailOptions } from 'payload'

import { portalConsoleEmailAdapter } from '@/lib/email/consoleAdapter'
import { RESEND_TEMPLATE_ALREADY_SENT } from '@/lib/email/resendTemplates'

const DEFAULT_FROM_NAME = 'Spector Craft Prize'

function skipIfTemplateAlreadySent(
  sendEmail: (message: SendEmailOptions) => Promise<unknown>,
): (message: SendEmailOptions) => Promise<unknown> {
  return async (message) => {
    if (String(message.html ?? '').includes(RESEND_TEMPLATE_ALREADY_SENT)) {
      return
    }

    return sendEmail(message)
  }
}

export function portalEmailAdapter() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const fromAddress = process.env.EMAIL_FROM_ADDRESS?.trim()

  if (apiKey && fromAddress) {
    const createResend = resendAdapter({
      apiKey,
      defaultFromAddress: fromAddress,
      defaultFromName: process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME,
    })

    return ((args) => {
      const adapter = createResend(args)
      return {
        ...adapter,
        sendEmail: skipIfTemplateAlreadySent(adapter.sendEmail),
      }
    }) as EmailAdapter
  }

  return ((args) => {
    const adapter = portalConsoleEmailAdapter(args)
    return {
      ...adapter,
      sendEmail: skipIfTemplateAlreadySent(adapter.sendEmail),
    }
  }) as EmailAdapter
}
