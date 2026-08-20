import type { Media } from '@/payload-types'

export type MediaSizeName = 'thumbnail' | 'card' | 'hero'

export type ResolvedMediaImage = {
  src: string
  alt: string
  width: number
  height: number
}

function isPopulated(value: number | Media | null | undefined): value is Media {
  return Boolean(value) && typeof value === 'object'
}

function toPublicSrc(src: string): string {
  if (src.startsWith('/')) {
    return src
  }

  try {
    const url = new URL(src)

    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return `${url.pathname}${url.search}`
    }

    const server = process.env.NEXT_PUBLIC_SERVER_URL

    if (server) {
      const origin = new URL(server).origin
      if (url.origin === origin) {
        return `${url.pathname}${url.search}`
      }
    }
  } catch {
    return src
  }

  return src
}

export function mediaUrl(value: number | Media | null | undefined, size?: MediaSizeName): string | null {
  return mediaImage(value, size)?.src ?? null
}

export function mediaImage(
  value: number | Media | null | undefined,
  size?: MediaSizeName,
): ResolvedMediaImage | null {
  if (!isPopulated(value)) {
    return null
  }

  const sized = size ? value.sizes?.[size] : undefined
  const src = sized?.url || value.url
  const width = sized?.width || value.width
  const height = sized?.height || value.height

  if (!src || !width || !height) {
    return null
  }

  return {
    src: toPublicSrc(src),
    alt: value.alt || '',
    width,
    height,
  }
}

export function mediaAlt(value: number | Media | null | undefined, fallback = ''): string {
  if (!isPopulated(value)) {
    return fallback
  }

  return value.alt || fallback
}

export function isVideo(value: number | Media | null | undefined): boolean {
  return isPopulated(value) && Boolean(value.mimeType?.startsWith('video/'))
}

export function mediaSrc(value: number | Media | null | undefined): string | null {
  if (!isPopulated(value)) {
    return null
  }

  return value.url ? toPublicSrc(value.url) : null
}
