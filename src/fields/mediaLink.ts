import type { TextField } from 'payload'

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
      description: 'Optional. Makes this image or video open the URL when clicked.',
      ...options.admin,
    },
  }
}
