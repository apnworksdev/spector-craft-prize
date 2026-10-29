import { describe, expect, it } from 'vitest'

import { evaluationsToCsv } from '@/lib/evaluations-csv'
import type { Evaluation } from '@/payload-types'

describe('evaluationsToCsv', () => {
  it('exports header and score rows', () => {
    const csv = evaluationsToCsv([
      {
        id: 1,
        listTitle: 'Ada - Juror',
        application: { id: 2, listTitle: 'Ada Lovelace' } as Evaluation['application'],
        juror: { id: 3, email: 'juror@example.com', listTitle: 'Naz Sahin' } as Evaluation['juror'],
        artisticExcellence: 5,
        culturalSignificance: 4,
        growthPotential: 3,
        missionAlignment: 4,
        total: 16,
        updatedAt: '2026-10-29T12:00:00.000Z',
        createdAt: '2026-10-29T12:00:00.000Z',
      } as Evaluation,
    ])

    expect(csv).toContain('List Title,Applicant,Juror,Artistic Excellence')
    expect(csv).toContain('Ada - Juror,Ada Lovelace,Naz Sahin,5,4,3,4,16')
  })
})
