import type { Evaluation } from '@/payload-types'

function csvEscape(value: string | number | null | undefined): string {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function relationLabel(
  value: Evaluation['application'] | Evaluation['juror'],
): string {
  if (!value) {
    return ''
  }
  if (typeof value === 'number') {
    return String(value)
  }
  if ('listTitle' in value && typeof value.listTitle === 'string' && value.listTitle.trim()) {
    return value.listTitle
  }
  if ('fullName' in value && typeof value.fullName === 'string' && value.fullName.trim()) {
    return value.fullName
  }
  if ('firstName' in value || 'lastName' in value) {
    const name = [value.firstName, value.lastName].filter(Boolean).join(' ').trim()
    if (name) {
      return name
    }
  }
  if ('email' in value && typeof value.email === 'string') {
    return value.email
  }
  return String(value.id)
}

export function evaluationsToCsv(evaluations: Evaluation[]): string {
  const header = [
    'List Title',
    'Applicant',
    'Juror',
    'Artistic Excellence',
    'Cultural Significance',
    'Growth Potential',
    'Mission Alignment',
    'Total',
    'Updated At',
  ]

  const rows = evaluations.map((evaluation) => [
    csvEscape(evaluation.listTitle),
    csvEscape(relationLabel(evaluation.application)),
    csvEscape(relationLabel(evaluation.juror)),
    csvEscape(evaluation.artisticExcellence),
    csvEscape(evaluation.culturalSignificance),
    csvEscape(evaluation.growthPotential),
    csvEscape(evaluation.missionAlignment),
    csvEscape(evaluation.total),
    csvEscape(evaluation.updatedAt),
  ])

  return [header.join(','), ...rows.map((row) => row.join(','))].join('\r\n')
}
