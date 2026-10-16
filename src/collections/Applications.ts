import type { CollectionConfig, Field } from 'payload'

import {
  applicationStatusUpdate,
  applicationsAdmin,
  applicationsCreate,
  applicationsDelete,
  applicationsRead,
  applicationsUpdate,
  governmentIdRead,
} from '@/access/applications'
import { adminField, notJurorField } from '@/access/roles'
import {
  assertApplicationFileOwnership,
  enforceApplicantOwnership,
  linkSubmissionFilesToApplication,
  lockSubmittedApplications,
  sendSubmissionConfirmationEmail,
  validateApplicationWordLimits,
} from '@/hooks/applications'
import { deleteApplicationEvaluations } from '@/hooks/evaluations'
import {
  ADDITIONAL_DETAILS_MAX_WORDS,
  APPLICATION_IMAGE_HELP,
  APPLICATION_VIDEO_HELP,
  ARTIST_STATEMENT_MAX_WORDS,
  BIO_SUMMARY_MAX_WORDS,
  PORTFOLIO_IMAGE_HELP,
  WHY_PRIZE_MAX_WORDS,
  WORK_DESCRIPTION_MAX_WORDS,
  WORK_SIGNIFICANCE_MAX_WORDS,
} from '@/lib/portal-media'
import { wordCountError } from '@/lib/word-count'

function workImageArray(name: string, description: string): Field {
  return {
    name,
    type: 'array',
    maxRows: 5,
    admin: {
      description,
    },
    fields: [
      {
        name: 'file',
        type: 'upload',
        relationTo: 'submission-files',
        required: true,
      },
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'yearCreated',
        type: 'text',
        required: true,
      },
      {
        name: 'materials',
        type: 'text',
        required: true,
      },
      {
        name: 'dimensions',
        type: 'text',
        required: true,
      },
      {
        name: 'additionalDetails',
        type: 'textarea',
        validate: (value) => wordCountError(value, ADDITIONAL_DETAILS_MAX_WORDS),
        admin: {
          description: `${ADDITIONAL_DETAILS_MAX_WORDS} words maximum.`,
        },
      },
      {
        name: 'setId',
        type: 'text',
        admin: {
          hidden: true,
        },
      },
    ],
  }
}

export const Applications: CollectionConfig = {
  slug: 'applications',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['applicant', 'program', 'status', 'updatedAt'],
    group: 'Submissions',
  },
  access: {
    admin: applicationsAdmin,
    create: applicationsCreate,
    read: applicationsRead,
    update: applicationsUpdate,
    delete: applicationsDelete,
  },
  hooks: {
    beforeChange: [enforceApplicantOwnership, assertApplicationFileOwnership, lockSubmittedApplications],
    beforeValidate: [validateApplicationWordLimits],
    afterChange: [linkSubmissionFilesToApplication, sendSubmissionConfirmationEmail],
    beforeDelete: [deleteApplicationEvaluations],
  },
  indexes: [
    {
      fields: ['applicant', 'program'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'applicant',
      type: 'relationship',
      relationTo: 'applicants',
      required: true,
      access: {
        update: adminField,
      },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'program',
      type: 'relationship',
      relationTo: 'programs',
      required: true,
      access: {
        update: adminField,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
      ],
      access: {
        update: applicationStatusUpdate,
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'selectedForEvaluation',
      type: 'checkbox',
      defaultValue: false,
      access: {
        read: notJurorField,
        update: adminField,
      },
      admin: {
        description: 'When checked, jurors can view this submitted application.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Personal',
          fields: [
            { name: 'fullName', type: 'text' },
            { name: 'artistName', type: 'text' },
            {
              name: 'dateOfBirth',
              type: 'date',
              admin: { date: { pickerAppearance: 'dayOnly' } },
            },
            { name: 'addressLine1', type: 'text' },
            { name: 'addressLine2', type: 'text' },
            { name: 'city', type: 'text' },
            { name: 'state', type: 'text' },
            { name: 'postalCode', type: 'text' },
            { name: 'country', type: 'text' },
            { name: 'phone', type: 'text' },
            { name: 'email', type: 'email' },
            { name: 'website', type: 'text' },
            { name: 'socialMedia', type: 'text' },
            {
              name: 'personalNotes',
              type: 'textarea',
              admin: { hidden: true },
            },
          ],
        },
        {
          label: 'Eligibility',
          fields: [
            { name: 'yearsOfPractice', type: 'text' },
            { name: 'trainingBackground', type: 'textarea' },
            { name: 'primaryCraftDiscipline', type: 'text' },
            {
              name: 'usCitizenOrResident',
              type: 'select',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ],
              admin: {
                description:
                  'Selected applicants must be able to provide a complete and accurate IRS Form W-9 for tax reporting purposes.',
              },
            },
            {
              name: 'eligibilityNotes',
              type: 'textarea',
              admin: { hidden: true },
            },
          ],
        },
        {
          label: 'Biographical',
          fields: [
            {
              name: 'educationalBackground',
              type: 'textarea',
            },
            {
              name: 'recentExhibitions',
              type: 'textarea',
            },
            {
              name: 'awardsRecognition',
              type: 'textarea',
            },
            {
              name: 'biographicalSummary',
              type: 'textarea',
              validate: (value) => wordCountError(value, BIO_SUMMARY_MAX_WORDS),
              admin: {
                description: `${BIO_SUMMARY_MAX_WORDS} words maximum.`,
              },
            },
          ],
        },
        {
          label: 'Submitted work',
          fields: [
            { name: 'workTitle', type: 'text' },
            { name: 'workYearCreated', type: 'text' },
            { name: 'workDimensions', type: 'text' },
            { name: 'workMaterials', type: 'text' },
            {
              name: 'artistStatement',
              type: 'textarea',
              validate: (value) => wordCountError(value, ARTIST_STATEMENT_MAX_WORDS),
              admin: {
                description: `Statement of practice. ${ARTIST_STATEMENT_MAX_WORDS} words maximum.`,
              },
            },
            {
              name: 'workDescription',
              type: 'textarea',
              validate: (value) => wordCountError(value, WORK_DESCRIPTION_MAX_WORDS),
              admin: {
                description: `Process. ${WORK_DESCRIPTION_MAX_WORDS} words maximum.`,
              },
            },
            {
              name: 'workSignificance',
              type: 'textarea',
              validate: (value) => wordCountError(value, WORK_SIGNIFICANCE_MAX_WORDS),
              admin: {
                description: `${WORK_SIGNIFICANCE_MAX_WORDS} words maximum.`,
              },
            },
            {
              name: 'whyPrize',
              type: 'textarea',
              validate: (value) => wordCountError(value, WHY_PRIZE_MAX_WORDS),
              admin: {
                description: `${WHY_PRIZE_MAX_WORDS} words maximum.`,
              },
            },
            workImageArray('workImages', APPLICATION_IMAGE_HELP),
            workImageArray('portfolioImages', PORTFOLIO_IMAGE_HELP),
            {
              name: 'workVideo',
              type: 'upload',
              relationTo: 'submission-files',
              admin: {
                description: APPLICATION_VIDEO_HELP,
              },
            },
          ],
        },
        {
          label: 'Submit',
          fields: [
            {
              name: 'declarationsAccepted',
              type: 'array',
              fields: [
                {
                  name: 'accepted',
                  type: 'checkbox',
                },
              ],
            },
            {
              name: 'governmentId',
              type: 'upload',
              relationTo: 'submission-files',
              access: {
                read: governmentIdRead,
                update: ({ req }) => {
                  const user = req.user
                  if (!user) return false
                  if (user.collection === 'users' && user.role === 'admin') return true
                  if (user.collection === 'applicants') return true
                  return false
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
