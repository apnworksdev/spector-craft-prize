import {
  evaluationTotal,
  formatJuryTotal,
  type JuryScoreValues,
} from '@/lib/jury-scores'
import { relationId } from '@/lib/portal'
import type { Application, Evaluation, Program } from '@/payload-types'

export type JuryStatusFilter = 'all' | 'incomplete' | 'complete'

export function parseJuryStatusFilter(value: string | undefined): JuryStatusFilter {
  if (value === 'incomplete' || value === 'complete') {
    return value
  }
  return 'all'
}

export function evaluationScores(evaluation: Evaluation): JuryScoreValues {
  return {
    artisticExcellence: evaluation.artisticExcellence,
    culturalSignificance: evaluation.culturalSignificance,
    growthPotential: evaluation.growthPotential,
    missionAlignment: evaluation.missionAlignment,
  }
}

export function juryScoreByApplication(
  evaluations: Evaluation[],
): Map<number, { total: number; label: string }> {
  const map = new Map<number, { total: number; label: string }>()

  for (const evaluation of evaluations) {
    const applicationId = relationId(evaluation.application)
    if (!applicationId) {
      continue
    }

    const total = evaluationTotal(evaluationScores(evaluation))
    map.set(applicationId, { total, label: formatJuryTotal(total) })
  }

  return map
}

export function programIdFromApplication(application: Application): number | null {
  return relationId(application.program)
}

export function programLabel(program: Program | number | null | undefined): string {
  if (program && typeof program === 'object') {
    return program.name
  }
  return 'Program'
}

export function uniqueProgramsFromApplications(applications: Application[]): Program[] {
  const byId = new Map<number, Program>()

  for (const application of applications) {
    const program = application.program
    if (program && typeof program === 'object') {
      byId.set(program.id, program)
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function partitionJuryApplications(
  applications: Application[],
  scoredIds: Set<number>,
): { incomplete: Application[]; complete: Application[] } {
  const incomplete: Application[] = []
  const complete: Application[] = []

  for (const application of applications) {
    if (scoredIds.has(application.id)) {
      complete.push(application)
    } else {
      incomplete.push(application)
    }
  }

  const byLabel = (a: Application, b: Application) =>
    (a.artistName || a.fullName || '').localeCompare(b.artistName || b.fullName || '')

  incomplete.sort(byLabel)
  complete.sort(byLabel)

  return { incomplete, complete }
}
