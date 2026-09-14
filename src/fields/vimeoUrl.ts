import type { TextField } from 'payload'

import { vimeoVideoId } from '@/lib/vimeo'

type VimeoUrlOptions = {
  admin?: TextField['admin']
}

/** Optional Vimeo link for banner / media column embeds. */
export function vimeoUrlField(options: VimeoUrlOptions = {}): TextField {
  return {
    name: 'vimeoUrl',
    type: 'text',
    label: 'Vimeo URL',
    admin: {
      description:
        'Optional. Paste a Vimeo link (Public or Unlisted). Preferred for longer films instead of uploading a video file.',
      ...options.admin,
    },
    validate: (value) => {
      if (!value) {
        return true
      }

      return vimeoVideoId(value) ? true : 'Enter a valid Vimeo URL or video ID'
    },
  }
}
