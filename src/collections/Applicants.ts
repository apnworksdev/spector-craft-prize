import type { CollectionConfig } from 'payload'

import { adminOnly, isAdmin, isApplicantUser } from '@/access/roles'
import { deleteApplicantDependents } from '@/hooks/applicants'
import { getServerURL } from '@/lib/env'
import { PORTAL_PATHS, SUPPORT_EMAIL } from '@/lib/portal'

const serverURL = getServerURL()

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
      generateEmailHTML: ({ token }) => {
        const url = `${serverURL}${PORTAL_PATHS.verify}?token=${token}`
        console.info(`Verification link: ${url}`)
        return `<p>Please verify your email to continue your application.</p><p><a href="${url}">Verify email</a></p>`
      },
    },
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Spector Craft Prize password',
      generateEmailHTML: ({ token }) => {
        const url = `${serverURL}${PORTAL_PATHS.resetPassword}?token=${token}`
        console.info(`Password reset link: ${url}`)
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
