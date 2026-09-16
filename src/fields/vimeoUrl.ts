import type { TextField } from 'payload'

import { vimeoVideoId } from '@/lib/vimeo'

type VimeoUrlOptions = {
  name?: string
  label?: string
  admin?: TextField['admin']
}

/** Optional Vimeo link for banner / media column embeds. */
export function vimeoUrlField(options: VimeoUrlOptions = {}): TextField {
  return {
    name: options.name ?? 'vimeoUrl',
    type: 'text',
    label: options.label ?? 'Vimeo URL',
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
