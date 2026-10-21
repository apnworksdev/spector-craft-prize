import { describe, expect, it } from 'vitest'

import { programAcceptsSubmissions, programDeadlinePassed } from '@/lib/program-deadline'

const deadline = '2027-03-04T12:00:00.000Z'

describe('programDeadlinePassed', () => {
  it('stays open through the evening of the deadline day in US time zones', () => {
    expect(programDeadlinePassed(deadline, new Date('2027-03-05T07:59:00.000Z'))).toBe(false)
    expect(programDeadlinePassed(deadline, new Date('2027-03-05T11:59:00.000Z'))).toBe(false)
  })

  it('closes once the deadline day has ended everywhere', () => {
    expect(programDeadlinePassed(deadline, new Date('2027-03-05T12:00:00.000Z'))).toBe(true)
  })

  it('treats a missing deadline as open', () => {
    expect(programDeadlinePassed(null)).toBe(false)
  })
})

describe('programAcceptsSubmissions', () => {
  const before = new Date('2027-03-01T00:00:00.000Z')

  it('requires a live program before the deadline', () => {
    expect(programAcceptsSubmissions({ status: 'live', deadline }, before)).toBe(true)
    expect(programAcceptsSubmissions({ status: 'closed', deadline }, before)).toBe(false)
    expect(programAcceptsSubmissions({ status: 'draft', deadline }, before)).toBe(false)
    expect(programAcceptsSubmissions(null, before)).toBe(false)
  })

  it('rejects a live program after the deadline', () => {
    expect(
      programAcceptsSubmissions({ status: 'live', deadline }, new Date('2027-03-06T00:00:00.000Z')),
    ).toBe(false)
  })
})
