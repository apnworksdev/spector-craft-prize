import type { Block } from 'payload'

import { mediaColumnHasContent } from '@/lib/richText'
import { MAX_UPLOAD_MB } from '@/lib/upload'

export const MediaColumnsBlock: Block = {
  slug: 'mediaColumns',
  interfaceName: 'MediaColumnsBlock',
  labels: {
    singular: 'Media columns',
    plural: 'Media columns',
  },
  fields: [
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: 'horizontal',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
      admin: {
        description: 'Crop for images and videos in this section.',
      },
    },
    {
      name: 'columns',
      type: 'array',
      minRows: 2,
      maxRows: 3,
      required: true,
      labels: {
        singular: 'Column',
        plural: 'Columns',
      },
      admin: {
        description: 'Two or three columns. Each needs an image/video, text, or both.',
      },
      validate: (value) => {
        const columns = Array.isArray(value) ? value : []

        if (columns.length < 2 || columns.length > 3) {
          return 'Add two or three columns'
        }

        const emptyIndex = columns.findIndex((column) => !mediaColumnHasContent(column))

        if (emptyIndex !== -1) {
          return `Column ${emptyIndex + 1} needs an image/video or text`
        }

        return true
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: `Optional image or compressed video (max ${MAX_UPLOAD_MB} MB).`,
          },
        },
        {
          name: 'content',
          type: 'richText',
          admin: {
            description: 'Optional. Leave empty if this column is media-only.',
          },
        },
      ],
    },
  ],
}
