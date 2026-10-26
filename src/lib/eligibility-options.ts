export const YEARS_OF_PRACTICE_OPTIONS = [
  'Less than 1 year',
  '1-2 years',
  '3-4 years',
  '5-6 years',
  '7 years',
  'More than 7 years (not eligible)',
] as const

export const TRAINING_BACKGROUND_OPTIONS = [
  'Traditional degree program (BA, BFA, MA, MFA, etc.)',
  'Non-accredited or alternative craft learning program',
  'Apprenticeship or mentorship',
  'Self-taught',
] as const

export const PRIMARY_CRAFT_DISCIPLINE_OPTIONS = [
  'Ceramics',
  'Woodworking',
  'Glass',
  'Textiles',
  'Paper Arts',
  'Basketry',
  'Metalwork',
] as const

export const OTHER_OPTION = 'Other'

export function splitSelectWithOther(
  value: string | null | undefined,
  options: readonly string[],
): { choice: string; other: string } {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return { choice: '', other: '' }
  }

  if ((options as readonly string[]).includes(trimmed)) {
    return { choice: trimmed, other: '' }
  }

  return { choice: OTHER_OPTION, other: trimmed }
}

export function resolveSelectWithOther(choice: string, other: string): string {
  if (choice === OTHER_OPTION) {
    return other.trim()
  }

  return choice.trim()
}
