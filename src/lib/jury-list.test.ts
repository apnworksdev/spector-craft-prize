import { describe, expect, it } from 'vitest'

import {
  juryScoreByApplication,
  parseJuryStatusFilter,
  partitionJuryApplications,
} from '@/lib/jury-list'
import type { Application, Evaluation } from '@/payload-types'

function application(id: number, name: string): Application {
  return {
    id,
    applicant: 1,
    program: 1,
    status: 'submitted',
    fullName: name,
    updatedAt: '',
    createdAt: '',
  }
}

function evaluation(applicationId: number, averageLike: number): Evaluation {
  return {
    id: applicationId,
    application: applicationId,
    juror: 1,
    artisticExcellence: averageLike,
    culturalSignificance: averageLike,
    growthPotential: averageLike,
    missionAlignment: averageLike,
    updatedAt: '',
    createdAt: '',
  }
}

describe('parseJuryStatusFilter', () => {
  it('defaults to all', () => {
    expect(parseJuryStatusFilter(undefined)).toBe('all')
    expect(parseJuryStatusFilter('nope')).toBe('all')
  })
})

describe('juryScoreByApplication', () => {
  it('maps totals out of 20 by application id', () => {
    const map = juryScoreByApplication([evaluation(9, 4)])
    expect(map.get(9)?.total).toBe(16)
    expect(map.get(9)?.label).toBe('16 / 20')
  })
})

describe('partitionJuryApplications', () => {
  it('lists incomplete before complete when concatenated by caller', () => {
    const scored = new Set([2])
    const { incomplete, complete } = partitionJuryApplications(
      [application(2, 'Zed'), application(1, 'Ada'), application(3, 'Bea')],
      scored,
    )
    expect(incomplete.map((item) => item.id)).toEqual([1, 3])
    expect(complete.map((item) => item.id)).toEqual([2])
  })
})
