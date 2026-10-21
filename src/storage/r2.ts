import { s3Storage } from '@payloadcms/storage-s3'

import { getR2PublicURL, isR2Configured, isR2SubmissionsConfigured } from '@/lib/env'

const r2Config = {
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  forcePathStyle: true,
}

export const r2Storage = s3Storage({
  enabled: isR2Configured(),
  clientUploads: true,
  collections: {
    media: {
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => {
        const key = prefix ? `${prefix}/${filename}` : filename
        return `${getR2PublicURL()}/${key}`
      },
    },
    documents: {
      prefix: 'documents',
      disablePayloadAccessControl: true,
      generateFileURL: ({ filename, prefix }) => {
        const key = prefix ? `${prefix}/${filename}` : filename
        return `${getR2PublicURL()}/${key}`
      },
    },
  },
  bucket: process.env.R2_BUCKET || '',
  config: r2Config,
})

// Must be a bucket with no public access: files are only served through Payload's
// access-checked /api/submission-files/file route (government IDs live here).
export const r2SubmissionsStorage = s3Storage({
  enabled: isR2SubmissionsConfigured(),
  alwaysInsertFields: true,
  collections: {
    'submission-files': {
      prefix: 'submissions',
    },
  },
  bucket: process.env.R2_SUBMISSIONS_BUCKET || '',
  config: r2Config,
})
