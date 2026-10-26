import type { CollectionConfig } from 'payload'

import { adminOnly, isAdmin, isApplicantUser } from '@/access/roles'
import { deleteApplicantDependents } from '@/hooks/applicants'
import {
  RESEND_TEMPLATE_ALREADY_SENT,
  sendResetPasswordTemplate,
  sendVerifyEmailTemplate,
} from '@/lib/email/resendTemplates'
import { getServerURL } from '@/lib/env'
import { PORTAL_PATHS, SUPPORT_EMAIL } from '@/lib/portal'

export const Applicants: CollectionConfig = {
  slug: 'applicants',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => user?.role !== 'admin',
    defaultColumns: ['email', 'firstName', 'lastName', 'updatedAt'],
  },
  auth: {
    verify: {
      generateEmailSubject: () => 'Verify your Spector Craft Prize account',
      generateEmailHTML: async (args) => {
        const token = encodeURIComponent(args?.token ?? '')
        const url = `${getServerURL()}${PORTAL_PATHS.verify}?token=${token}`
        const email = typeof args?.user?.email === 'string' ? args.user.email : ''

        if (email) {
          try {
            if (await sendVerifyEmailTemplate(email, url)) {
              return RESEND_TEMPLATE_ALREADY_SENT
            }
          } catch (error) {
            console.error('Verify email template failed; falling back to inline HTML.', error)
          }
        }

        return `<p>Please verify your email to continue your application.</p><p><a href="${url}">Verify email</a></p>`
      },
    },
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Spector Craft Prize password',
      generateEmailHTML: async (args) => {
        const token = encodeURIComponent(args?.token ?? '')
        const url = `${getServerURL()}${PORTAL_PATHS.resetPassword}?token=${token}`
        const email = typeof args?.user?.email === 'string' ? args.user.email : ''

        if (email) {
          try {
            if (await sendResetPasswordTemplate(email, url)) {
              return RESEND_TEMPLATE_ALREADY_SENT
            }
          } catch (error) {
            console.error('Reset password template failed; falling back to inline HTML.', error)
          }
        }

        return `<p>Reset your password using the link below.</p><p><a href="${url}">Reset password</a></p><p>If you did not request this, contact ${SUPPORT_EMAIL}.</p>`
      },
    },
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  access: {
    admin: () => false,
    create: () => true,
    read: ({ req }) => {
      if (isAdmin(req.user)) {
        return true
      }

      if (isApplicantUser(req.user) && req.user?.id) {
        return {
          id: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    update: ({ req }) => {
      if (isAdmin(req.user)) {
        return true
      }

      if (isApplicantUser(req.user) && req.user?.id) {
        return {
          id: {
            equals: req.user.id,
          },
        }
      }

      return false
    },
    delete: adminOnly,
  },
  hooks: {
    beforeDelete: [deleteApplicantDependents],
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
  ],
}
