import { SELECTION_CRITERIA } from '@/lib/portal'

export const JURY_SCORE_MIN = 1
export const JURY_SCORE_MAX = 5

export const JURY_SCORE_FIELDS = [
  {
    name: 'artisticExcellence',
    title: SELECTION_CRITERIA[0].title,
    body: SELECTION_CRITERIA[0].body,
  },
  {
    name: 'culturalSignificance',
    title: SELECTION_CRITERIA[1].title,
    body: SELECTION_CRITERIA[1].body,
  },
  {
    name: 'growthPotential',
    title: SELECTION_CRITERIA[2].title,
    body: SELECTION_CRITERIA[2].body,
  },
  {
    name: 'missionAlignment',
    title: SELECTION_CRITERIA[3].title,
    body: SELECTION_CRITERIA[3].body,
  },
] as const

export type JuryScoreFieldName = (typeof JURY_SCORE_FIELDS)[number]['name']
export type JuryScoreValues = Record<JuryScoreFieldName, number>

export function isValidJuryScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= JURY_SCORE_MIN && value <= JURY_SCORE_MAX
}

export function evaluationAverage(scores: JuryScoreValues): number {
  const total = JURY_SCORE_FIELDS.reduce((sum, field) => sum + scores[field.name], 0)
  return total / JURY_SCORE_FIELDS.length
}

export function meanEvaluationAverage(evaluations: JuryScoreValues[]): number | null {
  if (evaluations.length === 0) {
    return null
  }

  const total = evaluations.reduce((sum, evaluation) => sum + evaluationAverage(evaluation), 0)
  return total / evaluations.length
}

export function formatJuryScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
