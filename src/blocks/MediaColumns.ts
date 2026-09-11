import type { Block } from 'payload'

import { mediaLinkField } from '@/fields/mediaLink'
import { youtubeUrlField } from '@/fields/youtubeUrl'
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
        description: 'Two or three columns. Each needs media, a YouTube URL, text, or a mix.',
      },
      validate: (value) => {
        const columns = Array.isArray(value) ? value : []

        if (columns.length < 2 || columns.length > 3) {
          return 'Add two or three columns'
        }

        const emptyIndex = columns.findIndex((column) => !mediaColumnHasContent(column))

        if (emptyIndex !== -1) {
          return `Column ${emptyIndex + 1} needs an image/video, YouTube URL, or text`
        }

        return true
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: `Optional image or short video file (max ${MAX_UPLOAD_MB} MB).`,
          },
        },
        youtubeUrlField(),
        mediaLinkField({
          admin: {
            description: 'Optional. Makes an uploaded image open this URL. Ignored for YouTube embeds.',
          },
        }),
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
