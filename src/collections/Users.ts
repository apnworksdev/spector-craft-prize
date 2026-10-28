import type { CollectionConfig } from 'payload'

import { adminField, adminOnly, isAdmin } from '@/access/roles'
import { deleteJurorEvaluations } from '@/hooks/evaluations'
import { syncUserListTitle } from '@/hooks/users'
import { usersRead, usersUpdate } from '@/access/users'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'listTitle',
    defaultColumns: ['listTitle', 'email', 'role', 'updatedAt'],
  },
  auth: {
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    },
  },
  access: {
    admin: ({ req }) => isAdmin(req.user),
    create: adminOnly,
    read: usersRead,
    update: usersUpdate,
    delete: adminOnly,
  },
  hooks: {
    beforeChange: [syncUserListTitle],
    beforeDelete: [deleteJurorEvaluations],
  },
  fields: [
    {
      name: 'listTitle',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Name used in CMS lists and Evaluations (falls back to email).',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'lastName',
      type: 'text',
      defaultValue: '',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Juror', value: 'juror' },
      ],
      access: {
        update: adminField,
      },
      admin: {
        description: 'Jurors use /jury. Only admins can open Payload /admin.',
      },
    },
    {
      name: 'canJury',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: adminField,
      },
      admin: {
        condition: (_, siblingData) => siblingData?.role === 'admin',
        description: 'Allow this admin to open the jury view at /jury.',
      },
    },
  ],
}
