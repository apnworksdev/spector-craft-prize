const ID_PATTERN = /^[\w-]{11}$/

export function youtubeVideoId(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null
  }

  const raw = value.trim()

  if (ID_PATTERN.test(raw)) {
    return raw
  }

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && ID_PATTERN.test(id) ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = url.searchParams.get('v')
      if (fromQuery && ID_PATTERN.test(fromQuery)) {
        return fromQuery
      }

      const parts = url.pathname.split('/').filter(Boolean)
      const marker = parts.findIndex((part) => part === 'embed' || part === 'shorts' || part === 'live')
      if (marker !== -1) {
        const id = parts[marker + 1]
        return id && ID_PATTERN.test(id) ? id : null
      }
    }
  } catch {
    return null
  }

  return null
}

/** Autoplay muted with standard controls (unmute, fullscreen, scrub, etc.). */
export function youtubeEmbedSrc(value: string | null | undefined): string | null {
  const id = youtubeVideoId(value)
  if (!id) {
    return null
  }

  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '1',
    fs: '1',
    iv_load_policy: '3',
    modestbranding: '1',
    playsinline: '1',
    rel: '0',
  })

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
