const ID_PATTERN = /^\d{6,12}$/
const HASH_PATTERN = /^[a-f0-9]{6,12}$/i

export type VimeoVideoRef = {
  id: string
  hash?: string
}

export function vimeoVideoRef(value: string | null | undefined): VimeoVideoRef | null {
  if (!value?.trim()) {
    return null
  }

  const raw = value.trim()

  if (ID_PATTERN.test(raw)) {
    return { id: raw }
  }

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')

    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') {
      return null
    }

    const parts = url.pathname.split('/').filter(Boolean)
    const hashFromQuery = url.searchParams.get('h')

    if (host === 'player.vimeo.com' && parts[0] === 'video') {
      const id = parts[1]
      if (!id || !ID_PATTERN.test(id)) {
        return null
      }

      return hashFromQuery ? { id, hash: hashFromQuery } : { id }
    }

    // /123456789, /123456789/abcdef, /video/123456789, /manage/videos/123456789
    let id: string | null = null
    let hash: string | undefined

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i]
      if (part && ID_PATTERN.test(part)) {
        id = part
        const next = parts[i + 1]
        if (next && HASH_PATTERN.test(next)) {
          hash = next
        }
        break
      }
    }

    if (!id) {
      return null
    }

    if (!hash && hashFromQuery) {
      hash = hashFromQuery
    }

    return hash ? { id, hash } : { id }
  } catch {
    return null
  }
}

export function vimeoVideoId(value: string | null | undefined): string | null {
  return vimeoVideoRef(value)?.id ?? null
}

/** Chromeless Vimeo embed — custom UI handles play/mute. Starts muted for autoplay. */
export function vimeoEmbedSrc(value: string | null | undefined): string | null {
  const ref = vimeoVideoRef(value)
  if (!ref) {
    return null
  }

  const params = new URLSearchParams({
    autoplay: '1',
    muted: '1',
    controls: '0',
    title: '0',
    byline: '0',
    portrait: '0',
    dnt: '1',
    playsinline: '1',
  })

  if (ref.hash) {
    params.set('h', ref.hash)
  }

  return `https://player.vimeo.com/video/${ref.id}?${params.toString()}`
}
