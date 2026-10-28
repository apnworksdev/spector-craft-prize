import { describe, expect, it } from 'vitest'

import {
  firstInvalidField,
  validateSubmitReady,
  validateWizardStep,
  wizardStepForField,
} from '@/lib/application-validation'
import type { Application, Program } from '@/payload-types'

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

describe('validateWizardStep', () => {
  it('flags missing personal fields', () => {
    const errors = validateWizardStep('personal', application())
    expect(errors.fullName).toBeTruthy()
    expect(errors.email).toBeTruthy()
  })

  it('rejects invalid email and future birth date', () => {
    const errors = validateWizardStep(
      'personal',
      application({
        fullName: 'Ada Lovelace',
        dateOfBirth: '2099-01-01',
        addressLine1: '1 Main',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'United States',
        phone: '555',
        email: 'not-an-email',
      }),
    )
    expect(errors.email).toBeTruthy()
    expect(errors.dateOfBirth).toBeTruthy()
  })

  it('requires a complete work image set on media', () => {
    const errors = validateWizardStep('media', application({ workImages: [] }))
    expect(errors.workImages).toBeTruthy()
  })

  it('allows incomplete personal fields when requireComplete is false', () => {
    const errors = validateWizardStep('personal', application(), { requireComplete: false })
    expect(errors).toEqual({})
  })

  it('still flags invalid filled values when requireComplete is false', () => {
    const errors = validateWizardStep(
      'personal',
      application({ email: 'not-an-email' }),
      { requireComplete: false },
    )
    expect(errors.email).toBeTruthy()
    expect(errors.fullName).toBeUndefined()
  })

  it('allows incomplete media when requireComplete is false', () => {
    const errors = validateWizardStep('media', application({ workImages: [] }), {
      requireComplete: false,
    })
    expect(errors.workImages).toBeUndefined()
  })
})

describe('validateSubmitReady', () => {
  const program = { declarations: [{ text: 'I agree' }] } as Program

  it('returns the first missing field in application order', () => {
    const errors = validateSubmitReady(
      application({
        email: 'ada@example.com',
        yearsOfPractice: '3-4 years',
      }),
      program,
    )
    expect(firstInvalidField(errors)).toBe('fullName')
    expect(wizardStepForField('fullName')).toBe('personal')
  })

  it('points at eligibility when personal is complete', () => {
    const errors = validateSubmitReady(
      application({
        fullName: 'Ada Lovelace',
        dateOfBirth: '1990-01-01',
        addressLine1: '1 Main',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'United States',
        phone: '555',
        email: 'ada@example.com',
      }),
      program,
    )
    expect(firstInvalidField(errors)).toBe('yearsOfPractice')
    expect(wizardStepForField(firstInvalidField(errors)!)).toBe('eligibility')
  })
})
