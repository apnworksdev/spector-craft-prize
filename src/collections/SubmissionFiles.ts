import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

import {
  submissionFilesCreate,
  submissionFilesDelete,
  submissionFilesRead,
  submissionFilesUpdate,
} from '@/access/submissionFiles'
import { assignSubmissionFileOwner, validateSubmissionFileRules } from '@/hooks/submissionFiles'
import {
  APPLICATION_IMAGE_TYPES,
  APPLICATION_VIDEO_MAX_BYTES,
  APPLICATION_VIDEO_TYPES,
  GOVERNMENT_ID_TYPES,
} from '@/lib/portal-media'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const SubmissionFiles: CollectionConfig = {
  slug: 'submission-files',
  admin: {
    group: 'Submissions',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  access: {
    admin: ({ req }) => req.user?.collection === 'users' && req.user.role === 'admin',
    create: submissionFilesCreate,
    read: submissionFilesRead,
    update: submissionFilesUpdate,
    delete: submissionFilesDelete,
  },
  hooks: {
    beforeValidate: [assignSubmissionFileOwner, validateSubmissionFileRules],
  },
  upload: {
    staticDir: path.resolve(dirname, '../../submission-files'),
    mimeTypes: [...APPLICATION_IMAGE_TYPES, ...APPLICATION_VIDEO_TYPES, ...GOVERNMENT_ID_TYPES],
    filesRequiredOnCreate: true,
    limits: {
      fileSize: APPLICATION_VIDEO_MAX_BYTES,
    },
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Government ID', value: 'id' },
      ],
    },
    {
      name: 'applicant',
      type: 'relationship',
      relationTo: 'applicants',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'application',
      type: 'relationship',
      relationTo: 'applications',
    },
  ],
}
