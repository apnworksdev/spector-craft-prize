import type { CollectionConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateDeletedRecipient, revalidateRecipient } from '@/hooks/revalidate'

export const PrizeRecipients: CollectionConfig = {
  slug: 'prize-recipients',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'edition', 'slug', 'updatedAt'],
    description:
      'Individual recipients. Layout: intro (text + portrait), featured work, then body text beside a stacked gallery.',
  },
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateRecipient],
    afterDelete: [revalidateDeletedRecipient],
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
      name: 'location',
      type: 'text',
      admin: {
        description: 'Shown under the name, e.g. Babson Park, USA.',
      },
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
      type: 'group',
      name: 'main',
      label: 'Main',
      admin: {
        description: 'Intro: text on the left, portrait on the right.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
        {
          name: 'content',
          type: 'richText',
          admin: {
            description: 'Bio text under the name and location.',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'secondary',
      label: 'Secondary',
      admin: {
        description: 'Featured work: text on the left, one or two images on the right.',
      },
      fields: [
        {
          name: 'images',
          type: 'array',
          labels: {
            singular: 'Image',
            plural: 'Images',
          },
          minRows: 0,
          maxRows: 2,
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              filterOptions: {
                mimeType: { contains: 'image' },
              },
            },
          ],
        },
        {
          name: 'content',
          type: 'richText',
          admin: {
            description: 'Project title, materials/year, and short description.',
          },
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Body content',
      admin: {
        description: 'Long-form text on the left, beside the gallery.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      labels: {
        singular: 'Image',
        plural: 'Gallery images',
      },
      admin: {
        description: 'Stacked images on the right of the body content.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: {
            mimeType: { contains: 'image' },
          },
        },
      ],
    },
  ],
}
