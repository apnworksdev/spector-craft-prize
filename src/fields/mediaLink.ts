import type { TextField } from 'payload'

import { isSafeHref } from '@/lib/urls'

type MediaLinkOptions = {
  admin?: TextField['admin']
}

/** Optional click-through URL for an image or video. */
export function mediaLinkField(options: MediaLinkOptions = {}): TextField {
  return {
    name: 'link',
    type: 'text',
    label: 'Link',
    admin: {
      description: 'Optional. Makes this image or video open the URL when clicked (same tab).',
      ...options.admin,
    },
    validate: (value: unknown) => {
      if (!value) {
        return true
      }

      return isSafeHref(String(value)) || 'Use a site path or an http(s), mailto, or tel link.'
    },
  }
}
