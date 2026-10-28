import { describe, expect, it } from 'vitest'

import {
  evaluationAverage,
  evaluationTotal,
  formatJuryTotal,
  isValidJuryScore,
  meanEvaluationTotal,
  medianEvaluationTotal,
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

describe('evaluationTotal', () => {
  it('sums the four criteria out of 20', () => {
    expect(
      evaluationTotal({
        artisticExcellence: 5,
        culturalSignificance: 4,
        growthPotential: 3,
        missionAlignment: 4,
      }),
    ).toBe(16)
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

describe('meanEvaluationTotal', () => {
  it('returns null when nobody has scored', () => {
    expect(meanEvaluationTotal([])).toBeNull()
  })

  it('averages each juror’s total out of 20', () => {
    expect(
      meanEvaluationTotal([
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
    ).toBe(12)
  })
})

describe('formatJuryTotal', () => {
  it('formats with the / 20 suffix', () => {
    expect(formatJuryTotal(16)).toBe('16 / 20')
    expect(formatJuryTotal(14.5)).toBe('14.5 / 20')
  })
})

describe('medianEvaluationTotal', () => {
  it('returns null when empty', () => {
    expect(medianEvaluationTotal([])).toBeNull()
  })

  it('returns the middle total for an odd count', () => {
    expect(
      medianEvaluationTotal([
        {
          artisticExcellence: 5,
          culturalSignificance: 5,
          growthPotential: 5,
          missionAlignment: 5,
        },
        {
          artisticExcellence: 3,
          culturalSignificance: 3,
          growthPotential: 3,
          missionAlignment: 3,
        },
        {
          artisticExcellence: 1,
          culturalSignificance: 1,
          growthPotential: 1,
          missionAlignment: 1,
        },
      ]),
    ).toBe(12)
  })

  it('averages the two middle totals for an even count', () => {
    expect(
      medianEvaluationTotal([
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
    ).toBe(12)
  })
})
