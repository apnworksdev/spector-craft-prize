import type { Block } from 'payload'

import { mediaLinkField } from '@/fields/mediaLink'
import { youtubeUrlField } from '@/fields/youtubeUrl'
import { MAX_UPLOAD_MB } from '@/lib/upload'

export const BannerBlock: Block = {
  slug: 'banner',
  interfaceName: 'BannerBlock',
  labels: {
    singular: 'Banner',
    plural: 'Banners',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: `Image or short video file (max ${MAX_UPLOAD_MB} MB). Or use YouTube URL below for longer films.`,
      },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const data = siblingData as { youtubeUrl?: string | null }
        if (!value && !data?.youtubeUrl) {
          return 'Add an image/video upload or a YouTube URL'
        }
        return true
      },
    },
    youtubeUrlField(),
    mediaLinkField({
      admin: {
        description: 'Optional. Makes an uploaded image open this URL. Ignored for YouTube embeds.',
      },
    }),
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'subtitle',
      type: 'text',
    },
  ],
}
