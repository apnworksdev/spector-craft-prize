import type { CollectionConfig } from 'payload'

import { publicRead } from '@/access/publicRead'

export const PrizeRecipients: CollectionConfig = {
  slug: 'prize-recipients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'edition', 'slug', 'updatedAt'],
    description: 'Individual recipients. More layout fields will be added later.',
  },
  access: {
    read: publicRead,
  },
  indexes: [
    {
      fields: ['edition', 'slug'],
      unique: true,
    },
  ],
  fields: [
    {
      name: 'edition',
      type: 'relationship',
      relationTo: 'editions',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'URL segment under the edition, e.g. /2026-prize-recipients/this-slug.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
}
