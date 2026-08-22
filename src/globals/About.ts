import type { Block, GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

const AboutTextSubBlock: Block = {
  slug: 'text',
  interfaceName: 'AboutTextSubBlock',
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

const AboutPersonSubBlock: Block = {
  slug: 'person',
  interfaceName: 'AboutPersonSubBlock',
  labels: {
    singular: 'Person',
    plural: 'People',
  },
  fields: [
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'inline',
      required: true,
      options: [
        { label: 'Inline — image beside text', value: 'inline' },
        { label: 'Stacked — image above text', value: 'stacked' },
      ],
      admin: {
        description: 'Inline for Advisory Board / Jury; stacked for Foundation profiles.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Role or title under the name.',
      },
    },
    {
      name: 'bio',
      type: 'richText',
    },
  ],
}

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About',
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('about')],
  },
  fields: [
    {
      name: 'groups',
      type: 'array',
      labels: {
        singular: 'Group',
        plural: 'Groups',
      },
      admin: {
        description:
          'Sidebar groups. Optional heading is a non-clickable label (e.g. “Three Interconnected Programs”); blocks under a heading are numbered. Groups without a heading are plain links.',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Optional parent heading.',
          },
        },
        {
          name: 'blocks',
          type: 'array',
          labels: {
            singular: 'Block',
            plural: 'Blocks',
          },
          minRows: 1,
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                description: 'Sidebar label for this section.',
              },
            },
            {
              name: 'content',
              type: 'richText',
              admin: {
                description: 'Intro text at the top of the panel.',
              },
            },
            {
              name: 'subBlocks',
              type: 'blocks',
              labels: {
                singular: 'Sub-block',
                plural: 'Sub-blocks',
              },
              blocks: [AboutTextSubBlock, AboutPersonSubBlock],
              admin: {
                description: 'Optional content below the intro: plain text or people.',
              },
            },
          ],
        },
      ],
    },
  ],
}
