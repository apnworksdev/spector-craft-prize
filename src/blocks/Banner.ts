import type { Block } from 'payload'

import { mediaLinkField } from '@/fields/mediaLink'
import { vimeoUrlField } from '@/fields/vimeoUrl'
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
        description: `Image or short video file (max ${MAX_UPLOAD_MB} MB). Or use Vimeo URL below for longer films.`,
      },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const data = siblingData as { vimeoUrl?: string | null }
        if (!value && !data?.vimeoUrl) {
          return 'Add an image/video upload or a Vimeo URL'
        }
        return true
      },
    },
    vimeoUrlField(),
    vimeoUrlField({
      name: 'vimeoUrlMobile',
      label: 'Vimeo URL (mobile)',
      admin: {
        description:
          'Optional. Vertical version for small screens. Falls back to the main Vimeo URL if empty.',
      },
    }),
    mediaLinkField({
      admin: {
        description: 'Optional. Makes an uploaded image open this URL. Ignored for Vimeo embeds.',
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
