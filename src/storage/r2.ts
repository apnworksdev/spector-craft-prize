import { s3Storage } from '@payloadcms/storage-s3'

import { getR2PublicURL, isR2Configured } from '@/lib/env'

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
  },
  bucket: process.env.R2_BUCKET || '',
  config: {
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    forcePathStyle: true,
  },
})
