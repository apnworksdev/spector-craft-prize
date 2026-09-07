type LexicalNode = {
  text?: unknown
  children?: unknown[]
}

export function hasLexicalText(content: unknown): boolean {
  if (!content || typeof content !== 'object') {
    return false
  }

  const visit = (node: unknown): boolean => {
    if (!node || typeof node !== 'object') {
      return false
    }

    const current = node as LexicalNode

    if (typeof current.text === 'string' && current.text.trim()) {
      return true
    }

    return Array.isArray(current.children) && current.children.some(visit)
  }

  return visit((content as { root?: unknown }).root)
}

export function mediaColumnHasContent(column: unknown): boolean {
  if (!column || typeof column !== 'object') {
    return false
  }

  const current = column as { media?: unknown; content?: unknown }
  return Boolean(current.media) || hasLexicalText(current.content)
}
