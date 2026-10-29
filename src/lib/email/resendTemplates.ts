export const RESEND_TEMPLATE_ALREADY_SENT = '<!--resend-template-already-sent-->'

const DEFAULT_FROM_NAME = 'Spector Craft Prize'

function fromAddress() {
  const address = process.env.EMAIL_FROM_ADDRESS?.trim()
  if (!address) {
    return null
  }

  const name = process.env.EMAIL_FROM_NAME?.trim() || DEFAULT_FROM_NAME
  return `${name} <${address}>`
}

export function verifyEmailTemplateId() {
  return process.env.RESEND_TEMPLATE_VERIFY_EMAIL?.trim() || ''
}

export function resetPasswordTemplateId() {
  return process.env.RESEND_TEMPLATE_RESET_PASSWORD?.trim() || ''
}

export function applicationSubmittedTemplateId() {
  return process.env.RESEND_TEMPLATE_APPLICATION_SUBMITTED?.trim() || ''
}

export async function sendResendTemplate(args: {
  to: string
  templateId: string
  subject: string
  variables: Record<string, string | number>
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = fromAddress()

  if (!apiKey || !from || !args.templateId) {
    return false
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      template: {
        id: args.templateId,
        variables: args.variables,
      },
    }),
  })

  const data = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null

  if (!response.ok || !data?.id) {
    const detail = data?.message || data?.name || `HTTP ${response.status}`
    throw new Error(`Resend template send failed: ${detail}`)
  }

  return true
}

export async function sendVerifyEmailTemplate(to: string, verifyUrl: string) {
  const templateId = verifyEmailTemplateId()
  if (!templateId) {
    return false
  }

  return sendResendTemplate({
    to,
    templateId,
    subject: 'Verify your Spector Craft Prize account',
    variables: { VERIFY_URL: verifyUrl },
  })
}

export async function sendResetPasswordTemplate(to: string, resetUrl: string) {
  const templateId = resetPasswordTemplateId()
  if (!templateId) {
    return false
  }

  return sendResendTemplate({
    to,
    templateId,
    subject: 'Reset your Spector Craft Prize password',
    variables: { RESET_URL: resetUrl },
  })
}

export async function sendApplicationSubmittedTemplate(args: {
  to: string
  subject: string
  programName: string
  applicantName?: string
}) {
  const templateId = applicationSubmittedTemplateId()
  if (!templateId) {
    return false
  }

  return sendResendTemplate({
    to: args.to,
    templateId,
    subject: args.subject,
    variables: {
      PROGRAM_NAME: args.programName,
      APPLICANT_NAME: args.applicantName?.trim() || 'there',
    },
  })
}
