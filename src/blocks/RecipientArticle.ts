import type { Block } from 'payload'

import { mediaLinkField } from '@/fields/mediaLink'
import { vimeoUrlField } from '@/fields/vimeoUrl'

export const RecipientTextBlock: Block = {
  slug: 'text',
  interfaceName: 'RecipientTextBlock',
  labels: {
    singular: 'Text',
    plural: 'Text',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}

export const RecipientMediaBlock: Block = {
  slug: 'media',
  interfaceName: 'RecipientMediaBlock',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Optional image. Or use Vimeo URL below for a vertical video.',
      },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const data = siblingData as { vimeoUrl?: string | null }
        if (!value && !data?.vimeoUrl) {
          return 'Add an image or a Vimeo URL'
        }
        return true
      },
    },
    vimeoUrlField({
      admin: {
        description:
          'Optional. Paste a Vimeo link for a vertical video. Preferred over uploading large files.',
      },
    }),
    mediaLinkField({
      admin: {
        description: 'Optional. Makes an uploaded image open this URL. Ignored for Vimeo embeds.',
      },
    }),
  ],
}
