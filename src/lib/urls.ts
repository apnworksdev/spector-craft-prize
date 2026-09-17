const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file):/i

export function isSafeHref(value: string): boolean {
  const href = value.trim()
  if (!href || DANGEROUS_SCHEME.test(href) || href.startsWith('//')) {
    return false
  }

  if (href.startsWith('/') || href.startsWith('#')) {
    return true
  }

  try {
    const url = new URL(href)
    return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:' || url.protocol === 'tel:'
  } catch {
    return false
  }
}

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function safeHref(value: string | null | undefined, fallback = '#'): string {
  if (!value?.trim()) {
    return fallback
  }

  const href = value.trim()
  return isSafeHref(href) ? href : fallback
}
