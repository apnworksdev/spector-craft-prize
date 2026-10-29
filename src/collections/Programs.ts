import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { adminOnly, isStaffUser } from '@/access/roles'

const normalizeProgramCode: CollectionBeforeValidateHook = ({ data }) => {
  if (!data || typeof data.code !== 'string') {
    return data
  }

  const code = data.code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12)

  return { ...data, code }
}

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'status', 'deadline', 'updatedAt'],
    group: 'Submissions',
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    admin: ({ req }) => isStaffUser(req.user),
  },
  hooks: {
    beforeValidate: [normalizeProgramCode],
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
      name: 'code',
      type: 'text',
      unique: true,
      maxLength: 12,
      admin: {
        description:
          'Short program code for jury/staff downloads, e.g. SCP26. Used in PDF and ZIP filenames with the applicant name. Required for clear download names.',
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
      type: 'tabs',
      tabs: [
        {
          label: 'Welcome page',
          description: 'Copy shown on the applicant welcome screen for this program.',
          fields: [
            {
              name: 'welcomeTitle',
              type: 'text',
              label: 'Welcome title',
            },
            {
              name: 'welcomeMessage',
              type: 'textarea',
              required: true,
              label: 'Welcome intro',
              admin: {
                description: 'Intro paragraphs. Separate paragraphs with a blank line.',
              },
            },
            {
              name: 'selectionCriteria',
              type: 'array',
              labels: {
                singular: 'Criterion',
                plural: 'Selection criteria',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'body',
                  type: 'textarea',
                  required: true,
                },
              ],
            },
            {
              name: 'rulesDocument',
              type: 'upload',
              relationTo: 'documents',
              label: 'Rules of Entry PDF',
              admin: {
                description:
                  'PDF linked as “Rules of Entry” on the welcome page and application wizard. Upload under Documents first, then select it here.',
              },
            },
          ],
        },
        {
          label: 'Messages & declarations',
          fields: [
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
              admin: {
                description:
                  'Fallback only — used if the Resend application-submitted template is not configured. Preferred copy lives in the Resend template.',
              },
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
        },
      ],
    },
  ],
}
