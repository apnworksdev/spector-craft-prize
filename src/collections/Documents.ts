import path from 'path'
import { fileURLToPath } from 'url'
import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'

import { revalidateDeletedDocument, revalidateDocument } from '@/hooks/revalidate'
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

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    description: `PDFs for Rules of Entry, FAQ, and other downloadable files. Max ${MAX_UPLOAD_MB} MB.`,
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeValidate: [rejectOversizedUpload],
    afterChange: [revalidateDocument],
    afterDelete: [revalidateDeletedDocument],
  },
  upload: {
    staticDir: path.resolve(dirname, '../../documents'),
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Name shown in the CMS, e.g. “Rules of Entry”.',
      },
    },
  ],
}
