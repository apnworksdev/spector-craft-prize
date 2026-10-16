import type { CollectionConfig } from 'payload'

import { adminOnly, isStaffUser } from '@/access/roles'

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'deadline', 'updatedAt'],
    group: 'Submissions',
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    admin: ({ req }) => isStaffUser(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Stable id, e.g. emerging-artists-2026-2027',
      },
    },
    {
      name: 'deadline',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Live', value: 'live' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: {
        description: 'Applicants can sign up and submit only when Live.',
      },
    },
    {
      name: 'rulesDocument',
      type: 'upload',
      relationTo: 'documents',
      admin: {
        description: 'Optional Rules of Entry PDF linked from the application.',
      },
    },
    {
      name: 'welcomeMessage',
      type: 'textarea',
      required: true,
    },
    {
      name: 'helpMessage',
      type: 'textarea',
      required: true,
    },
    {
      name: 'incompleteMessage',
      type: 'textarea',
      required: true,
    },
    {
      name: 'readyToSubmitMessage',
      type: 'textarea',
      required: true,
    },
    {
      name: 'confirmationEmailBody',
      type: 'textarea',
      required: true,
    },
    {
      name: 'declarations',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
}
