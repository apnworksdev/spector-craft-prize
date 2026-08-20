import type { Block } from 'payload'

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
      required: true,
      admin: {
        description: `Image or compressed video (H.264 MP4 around 1080p, max ${MAX_UPLOAD_MB} MB).`,
      },
    },
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
