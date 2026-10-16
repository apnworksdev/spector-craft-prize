import { describe, expect, it } from 'vitest'

import {
  evaluationAverage,
  isValidJuryScore,
  meanEvaluationAverage,
} from '@/lib/jury-scores'

describe('isValidJuryScore', () => {
  it('accepts integers from 1 to 5', () => {
    expect(isValidJuryScore(1)).toBe(true)
    expect(isValidJuryScore(5)).toBe(true)
    expect(isValidJuryScore(0)).toBe(false)
    expect(isValidJuryScore(6)).toBe(false)
    expect(isValidJuryScore(3.5)).toBe(false)
  })
})

describe('evaluationAverage', () => {
  it('averages the four criteria', () => {
    expect(
      evaluationAverage({
        artisticExcellence: 5,
        culturalSignificance: 4,
        growthPotential: 3,
        missionAlignment: 4,
      }),
    ).toBe(4)
  })
})

describe('meanEvaluationAverage', () => {
  it('returns null when nobody has scored', () => {
    expect(meanEvaluationAverage([])).toBeNull()
  })

  it('averages each juror’s average', () => {
    expect(
      meanEvaluationAverage([
        {
          artisticExcellence: 5,
          culturalSignificance: 5,
          growthPotential: 5,
          missionAlignment: 5,
        },
        {
          artisticExcellence: 1,
          culturalSignificance: 1,
          growthPotential: 1,
          missionAlignment: 1,
        },
      ]),
    ).toBe(3)
  })
})
