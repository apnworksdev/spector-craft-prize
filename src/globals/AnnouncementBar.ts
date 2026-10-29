import type { GlobalConfig } from 'payload'

import { publicRead } from '@/access/publicRead'
import { revalidateGlobal } from '@/hooks/revalidate'
import { isSafeHref } from '@/lib/urls'

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/

function validateHexColor(value: unknown): true | string {
  if (value == null || value === '') {
    return true
  }

  if (typeof value !== 'string' || !HEX_COLOR.test(value.trim())) {
    return 'Use a hex color like #F0F0F0 or #333.'
  }

  return true
}

export const AnnouncementBar: GlobalConfig = {
  slug: 'announcement-bar',
  label: 'Announcement Bar',
  admin: {
    description: 'Optional site-wide banner above the header. Toggle Active to show or hide it.',
  },
  access: {
    read: publicRead,
  },
  hooks: {
    afterChange: [revalidateGlobal('announcement-bar')],
  },
  fields: [
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      label: 'Active',
      admin: {
        description: 'Show the announcement bar on the public site.',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      label: 'Text',
      admin: {
        description: 'Message shown in the bar. Typically uppercase on the site.',
      },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link',
      admin: {
        description:
          'Optional. Site path or full URL when the bar is clicked. Examples: /emerging-artists-prize, https://…',
      },
      validate: (value: unknown) => {
        if (value == null || value === '') {
          return true
        }
        if (!isSafeHref(String(value))) {
          return 'Use a site path or an http(s), mailto, or tel link.'
        }
        return true
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Background color',
      defaultValue: '#F0F0F0',
      admin: {
        description: 'Hex color for the bar background, e.g. #F0F0F0.',
      },
      validate: validateHexColor,
    },
    {
      name: 'textColor',
      type: 'text',
      label: 'Text color',
      defaultValue: '#666666',
      admin: {
        description: 'Hex color for the announcement text, e.g. #666666.',
      },
      validate: validateHexColor,
    },
  ],
}
