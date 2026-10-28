import { describe, expect, it } from 'vitest'

import {
  applicationDownloadBasename,
  applicationIdFromJurySlug,
  applicationJuryPath,
  applicationPathKey,
  applicationStaffPath,
  contentDispositionAttachment,
  filenameSegment,
  programJuryPath,
} from '@/lib/portal'

describe('filenameSegment', () => {
  it('keeps readable ascii names', () => {
    expect(filenameSegment('Ada Lovelace')).toBe('Ada-Lovelace')
  })

  it('strips accents and punctuation', () => {
    expect(filenameSegment('José — “Studio”')).toBe('Jose-Studio')
  })
})

describe('applicationDownloadBasename', () => {
  it('uses program code and applicant name', () => {
    expect(
      applicationDownloadBasename({
        id: 3,
        artistName: 'Ada Lovelace',
        program: { code: 'scp26', slug: 'emerging-artists-2026-2027' },
      }),
    ).toBe('SCP26_Ada-Lovelace')
  })

  it('falls back to slug when code is missing', () => {
    expect(
      applicationDownloadBasename({
        id: 9,
        fullName: 'Polly Adams',
        program: { slug: 'emerging-artists-2026-2027' },
      }),
    ).toBe('EMERGING-ART_Polly-Adams')
  })

  it('falls back when program is unpopulated', () => {
    expect(
      applicationDownloadBasename({
        id: 1,
        artistName: 'Studio One',
        program: 4,
      }),
    ).toBe('APP_Studio-One')
  })
})

describe('contentDispositionAttachment', () => {
  it('quotes the filename', () => {
    expect(contentDispositionAttachment('SCP26_Ada-Lovelace.pdf')).toBe(
      'attachment; filename="SCP26_Ada-Lovelace.pdf"',
    )
  })
})

describe('applicationJuryPath', () => {
  it('builds a program-code and applicant path', () => {
    expect(
      applicationJuryPath({
        id: 3,
        artistName: 'Ada Lovelace',
        program: { code: 'SCP26' },
      }),
    ).toBe('/jury/scp26/ada-lovelace')
  })

  it('keeps the person segment when the stored slug includes the program', () => {
    expect(
      applicationJuryPath({
        id: 9,
        artistName: 'Naz Sahin',
        slug: 'scp26-naz-sahin',
        program: { code: 'SCP26' },
      }),
    ).toBe('/jury/scp26/naz-sahin')
    expect(
      applicationStaffPath({
        id: 9,
        artistName: 'Naz Sahin',
        slug: 'scp26-naz-sahin',
        program: { code: 'SCP26' },
      }),
    ).toBe('/staff/scp26/naz-sahin')
    expect(
      applicationPathKey({
        id: 9,
        artistName: 'Naz Sahin',
        slug: 'scp26-naz-sahin',
        program: { code: 'SCP26' },
      }),
    ).toBe('scp26-naz-sahin')
  })

  it('uses the same person segment in a second program', () => {
    expect(
      applicationJuryPath({
        id: 11,
        artistName: 'Naz Sahin',
        slug: 'scp27-naz-sahin',
        program: { code: 'SCP27' },
      }),
    ).toBe('/jury/scp27/naz-sahin')
  })

  it('builds a program list path from the code', () => {
    expect(programJuryPath({ code: 'SCP26' })).toBe('/jury/scp26')
  })

  it('parses the application id from the slug', () => {
    expect(applicationIdFromJurySlug('ada-lovelace-3')).toBe(3)
    expect(applicationIdFromJurySlug('3')).toBe(3)
    expect(applicationIdFromJurySlug('untitled')).toBeNull()
  })
})
