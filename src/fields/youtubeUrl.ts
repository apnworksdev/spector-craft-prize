import type { TextField } from 'payload'

import { youtubeVideoId } from '@/lib/youtube'

type YouTubeUrlOptions = {
  admin?: TextField['admin']
}

/** Optional YouTube link for banner / media column embeds. */
export function youtubeUrlField(options: YouTubeUrlOptions = {}): TextField {
  return {
    name: 'youtubeUrl',
    type: 'text',
    label: 'YouTube URL',
    admin: {
      description:
        'Optional. Paste a YouTube link (Public or Unlisted). Preferred for longer films instead of uploading a video file.',
      ...options.admin,
    },
    validate: (value) => {
      if (!value) {
        return true
      }

      return youtubeVideoId(value) ? true : 'Enter a valid YouTube URL or video ID'
    },
  }
}
