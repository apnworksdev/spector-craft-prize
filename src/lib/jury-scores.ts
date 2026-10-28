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

/** Max total when every criterion is scored at JURY_SCORE_MAX (4 × 5 = 20). */
export const JURY_SCORE_TOTAL_MAX = JURY_SCORE_FIELDS.length * JURY_SCORE_MAX

export function isValidJuryScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= JURY_SCORE_MIN && value <= JURY_SCORE_MAX
}

/** Sum of the four criteria (1–20). */
export function evaluationTotal(scores: JuryScoreValues): number {
  return JURY_SCORE_FIELDS.reduce((sum, field) => sum + Number(scores[field.name] || 0), 0)
}

/** Mean of the four criteria (1–5). Kept for compatibility. */
export function evaluationAverage(scores: JuryScoreValues): number {
  return evaluationTotal(scores) / JURY_SCORE_FIELDS.length
}

/** Panel grade: average of each juror’s total (still out of 20). */
export function meanEvaluationTotal(evaluations: JuryScoreValues[]): number | null {
  if (evaluations.length === 0) {
    return null
  }

  const total = evaluations.reduce((sum, evaluation) => sum + evaluationTotal(evaluation), 0)
  return total / evaluations.length
}

/** Panel grade: median of each juror’s total (out of 20). Used for CMS sorting. */
export function medianEvaluationTotal(evaluations: JuryScoreValues[]): number | null {
  if (evaluations.length === 0) {
    return null
  }

  const totals = evaluations.map(evaluationTotal).sort((a, b) => a - b)
  const mid = Math.floor(totals.length / 2)
  if (totals.length % 2 === 0) {
    return (totals[mid - 1]! + totals[mid]!) / 2
  }
  return totals[mid]!
}

/** @deprecated Prefer meanEvaluationTotal for out-of-20 panel grades. */
export function meanEvaluationAverage(evaluations: JuryScoreValues[]): number | null {
  const meanTotal = meanEvaluationTotal(evaluations)
  return meanTotal == null ? null : meanTotal / JURY_SCORE_FIELDS.length
}

export function formatJuryScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

/** e.g. `16 / 20` or `14.5 / 20` */
export function formatJuryTotal(value: number): string {
  return `${formatJuryScore(value)} / ${JURY_SCORE_TOTAL_MAX}`
}
