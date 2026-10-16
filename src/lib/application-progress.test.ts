import { describe, expect, it } from 'vitest'

import { canOpenStep, stepComplete } from '@/lib/application-progress'
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
  trainingBackground: 'Apprenticeship',
  primaryCraftDiscipline: 'Ceramics',
  usCitizenOrResident: 'yes' as const,
}

describe('application progress', () => {
  it('blocks later steps until personal is complete', () => {
    const draft = application()
    expect(stepComplete(draft, 'personal')).toBe(false)
    expect(canOpenStep(draft, 'bio')).toBe(false)
  })

  it('allows bio after personal and eligibility', () => {
    const draft = application({
      ...personal,
      ...eligibility,
    })
    expect(canOpenStep(draft, 'bio')).toBe(true)
    expect(canOpenStep(draft, 'work')).toBe(false)
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
    expect(canOpenStep(draft, 'submit')).toBe(false)
  })
})
