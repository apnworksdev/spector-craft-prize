import path from 'path'
import { fileURLToPath } from 'url'
import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'

import { revalidateDeletedMedia, revalidateMedia } from '@/hooks/revalidate'
import { MAX_UPLOAD_MB, uploadSizeError } from '@/lib/upload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const rejectOversizedUpload: CollectionBeforeValidateHook = ({ data, req }) => {
  const filesize = data?.filesize ?? req.file?.size
  const error = uploadSizeError(typeof filesize === 'number' ? filesize : undefined)

  if (error !== true) {
    throw new APIError(error, 400)
  }

  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    description: `Images or short compressed videos. Max ${MAX_UPLOAD_MB} MB. Videos should be H.264 MP4 around 1080p — not camera originals.`,
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [rejectOversizedUpload],
    afterChange: [revalidateMedia],
    afterDelete: [revalidateDeletedMedia],
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
      'video/mp4',
      'video/webm',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        withoutEnlargement: true,
      },
      {
        name: 'card',
        width: 960,
        withoutEnlargement: true,
      },
      {
        name: 'hero',
        width: 2560,
        withoutEnlargement: true,
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Optional. Used for accessibility when there is no title next to the image. Leave empty if the image is decorative.',
      },
    },
  ],
}
