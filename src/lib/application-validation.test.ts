import { describe, expect, it } from 'vitest'

import { validateWizardStep } from '@/lib/application-validation'
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
})
