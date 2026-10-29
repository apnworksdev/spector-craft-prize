import { describe, expect, it } from 'vitest'

import {
  applicationProgressPercent,
  canOpenStep,
  formsFillRatio,
  furthestAllowedStep,
  stepComplete,
  stepFillRatio,
} from '@/lib/application-progress'
import type { Application } from '@/payload-types'

function application(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    applicant: 1,
    program: 1,
    status: 'draft',
    updatedAt: '',
    createdAt: '',
    ...overrides,
  }
}

const personal = {
  fullName: 'Ada Lovelace',
  dateOfBirth: '1990-01-01',
  addressLine1: '1 Main Street',
  city: 'Portland',
  state: 'OR',
  postalCode: '97201',
  country: 'United States',
  phone: '555-0100',
  email: 'ada@example.com',
}

const eligibility = {
  yearsOfPractice: '4',
  practiceBegan: 'March 2021',
  trainingBackground: 'Apprenticeship',
  primaryCraftDiscipline: 'Ceramics',
  usCitizenOrResident: 'yes' as const,
}

describe('application progress', () => {
  it('allows opening later steps even when earlier sections are incomplete', () => {
    const draft = application()
    expect(stepComplete(draft, 'personal')).toBe(false)
    expect(canOpenStep(draft, 'bio')).toBe(true)
    expect(canOpenStep(draft, 'submit')).toBe(true)
  })

  it('still reports the first incomplete step for resume links', () => {
    const draft = application({
      ...personal,
      ...eligibility,
    })
    expect(furthestAllowedStep(draft)).toBe('bio')
  })

  it('allows work as soon as biography is complete, even if work is empty', () => {
    const draft = application({
      ...personal,
      ...eligibility,
      educationalBackground: 'Studied ceramics.',
      biographicalSummary: 'A short biography.',
    })
    expect(furthestAllowedStep(draft)).toBe('work')
    expect(canOpenStep(draft, 'media')).toBe(true)
  })

  it('reports zero progress for an empty draft', () => {
    expect(applicationProgressPercent(application())).toBe(0)
  })

  it('fills a step by the share of required fields', () => {
    const draft = application({ fullName: 'Ada Lovelace', email: 'ada@example.com' })
    expect(stepFillRatio(draft, 'personal')).toBeCloseTo(2 / 9)
    expect(formsFillRatio(draft)).toBeCloseTo(2 / 24)
  })

  it('allows media after the submitted work fields', () => {
    const draft = application({
      ...personal,
      ...eligibility,
      educationalBackground: 'Studied ceramics.',
      biographicalSummary: 'A short biography.',
      workTitle: 'Vessel',
      workYearCreated: '2024',
      workDimensions: '10 x 10 x 10 in',
      workMaterials: 'Porcelain',
      artistStatement: 'A statement.',
      workDescription: 'A description.',
      workSignificance: 'A significance note.',
      whyPrize: 'Why this prize.',
    })
    expect(canOpenStep(draft, 'media')).toBe(true)
    expect(canOpenStep(draft, 'submit')).toBe(true)
    expect(furthestAllowedStep(draft)).toBe('media')
  })
})
