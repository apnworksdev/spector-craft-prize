import { randomBytes } from 'node:crypto'

import { NextResponse } from 'next/server'
import { createLocalReq } from 'payload'

import { sendVerifyEmailTemplate } from '@/lib/email/resendTemplates'
import { getServerURL } from '@/lib/env'
import { getPayloadClient } from '@/lib/payload'
import { PORTAL_PATHS } from '@/lib/portal'

const OK_MESSAGE = 'If that account needs verification, we sent a new email.'

function verificationEmailHtml(token: string) {
  const url = `${getServerURL()}${PORTAL_PATHS.verify}?token=${encodeURIComponent(token)}`
  return `<p>Please verify your email to continue your application.</p><p><a href="${url}">Verify email</a></p>`
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null
  const email = body?.email?.trim().toLowerCase()

  if (!email) {
    return NextResponse.json({ message: 'Email is required.' }, { status: 400 })
  }

  try {
    const payload = await getPayloadClient()
    const req = await createLocalReq({}, payload)
    const found = await payload.find({
      collection: 'applicants',
      limit: 1,
      overrideAccess: true,
      req,
      showHiddenFields: true,
      where: {
        email: {
          equals: email,
        },
      },
    })

    const user = found.docs[0] as
      | {
          id: number
          email: string
          _verified?: boolean | null
          _verificationToken?: string | null
        }
      | undefined

    if (user && user._verified === false) {
      const token = user._verificationToken?.trim() || randomBytes(20).toString('hex')

      if (!user._verificationToken?.trim()) {
        await payload.db.updateOne({
          id: user.id,
          collection: 'applicants',
          data: {
            ...user,
            _verificationToken: token,
            updatedAt: new Date().toISOString(),
          },
          req,
          returning: false,
        })
      }

      const verifyUrl = `${getServerURL()}${PORTAL_PATHS.verify}?token=${encodeURIComponent(token)}`
      const sentWithTemplate = await sendVerifyEmailTemplate(user.email, verifyUrl).catch((error) => {
        console.error('Verify email template failed; falling back to inline HTML.', error)
        return false
      })

      if (!sentWithTemplate) {
        await payload.sendEmail({
          html: verificationEmailHtml(token),
          subject: 'Verify your Spector Craft Prize account',
          to: user.email,
        })
      }
    }
  } catch (error) {
    console.error('resend-verification failed', error)
  }

  return NextResponse.json({ message: OK_MESSAGE })
}
