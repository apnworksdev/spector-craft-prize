export function wordCount(value: string | null | undefined): number {
  if (!value?.trim()) {
    return 0
  }

  return value.trim().split(/\s+/).filter(Boolean).length
}

export function wordCountError(value: string | null | undefined, maxWords: number): string | true {
  const count = wordCount(value)

  if (count > maxWords) {
    return `Use ${maxWords} words or fewer. Currently ${count}.`
  }

  return true
}
