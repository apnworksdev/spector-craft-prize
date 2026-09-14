import type { Field, GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'

const navLinkFields: Field[] = [
  {
    name: 'label',
    type: 'text',
    required: true,
  },
  {
    name: 'url',
    type: 'text',
    admin: {
      description:
        'Site path or full URL for pages. Examples: /about, /2026-prize-recipients. Leave empty if you upload a PDF below.',
    },
    validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
      const data = siblingData as { file?: unknown }
      if (!value && !data?.file) {
        return 'Add a URL or upload a PDF'
      }
      return true
    },
  },
  {
    name: 'file',
    type: 'upload',
    relationTo: 'documents',
    admin: {
      description: 'Optional PDF. If set, this is used instead of the URL.',
    },
  },
  {
    name: 'openInNewTab',
    type: 'checkbox',
    defaultValue: false,
    label: 'Open in new tab',
    admin: {
      description: 'Recommended for PDFs and external links.',
    },
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Header & Footer',
  admin: {
    description: 'Edit header and footer menu links. Reorder rows to change order.',
  },
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('navigation')],
  },
  fields: [
    {
      name: 'header',
      type: 'array',
      labels: {
        singular: 'Link',
        plural: 'Header links',
      },
      admin: {
        description: 'Primary header navigation.',
      },
      fields: navLinkFields,
      defaultValue: [
        { label: '2026 Prize Recipients', url: '/2026-prize-recipients', openInNewTab: false },
        { label: 'Emerging Artists Prize', url: '/emerging-artists-prize', openInNewTab: false },
        { label: 'About', url: '/about', openInNewTab: false },
        { label: 'Press', url: '/press', openInNewTab: false },
      ],
    },
    {
      name: 'footerPrimary',
      type: 'array',
      label: 'Footer — main',
      labels: {
        singular: 'Link',
        plural: 'Footer main links',
      },
      fields: navLinkFields,
      defaultValue: [
        { label: 'Home', url: '/', openInNewTab: false },
        { label: '2026 Prize Recipients', url: '/2026-prize-recipients', openInNewTab: false },
        { label: 'Emerging Artists Prize', url: '/emerging-artists-prize', openInNewTab: false },
        { label: 'About', url: '/about', openInNewTab: false },
        { label: 'Press', url: '/press', openInNewTab: false },
      ],
    },
    {
      name: 'footerLegal',
      type: 'array',
      label: 'Footer — legal',
      labels: {
        singular: 'Link',
        plural: 'Footer legal links',
      },
      fields: navLinkFields,
      defaultValue: [
        { label: 'Terms & Conditions', url: '/terms', openInNewTab: false },
        { label: 'Privacy Policy', url: '/privacy', openInNewTab: false },
      ],
    },
  ],
}
