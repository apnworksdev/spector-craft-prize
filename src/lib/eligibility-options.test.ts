import { describe, expect, it } from 'vitest'

import {
  OTHER_OPTION,
  TRAINING_BACKGROUND_OPTIONS,
  resolveSelectWithOther,
  splitSelectWithOther,
} from '@/lib/eligibility-options'

describe('splitSelectWithOther', () => {
  it('maps known options to the select choice', () => {
    expect(splitSelectWithOther('Self-taught', TRAINING_BACKGROUND_OPTIONS)).toEqual({
      choice: 'Self-taught',
      other: '',
    })
  })

  it('maps unknown values to Other', () => {
    expect(splitSelectWithOther('Community workshop', TRAINING_BACKGROUND_OPTIONS)).toEqual({
      choice: OTHER_OPTION,
      other: 'Community workshop',
    })
  })
})

describe('resolveSelectWithOther', () => {
  it('returns the choice when not Other', () => {
    expect(resolveSelectWithOther('Self-taught', 'ignored')).toBe('Self-taught')
  })

  it('returns the other text when Other is selected', () => {
    expect(resolveSelectWithOther(OTHER_OPTION, ' Community workshop ')).toBe(
      'Community workshop',
    )
  })
})
