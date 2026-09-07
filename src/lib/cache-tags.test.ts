import { describe, expect, it } from 'vitest'

import {
  CMS_TAGS,
  tagsForEdition,
  tagsForGlobal,
  tagsForRecipient,
} from '@/lib/cache-tags'

describe('tagsForGlobal', () => {
  it('returns a dedicated tag for each singleton page', () => {
    expect(tagsForGlobal('home')).toEqual([CMS_TAGS.home])
    expect(tagsForGlobal('about')).toEqual([CMS_TAGS.about])
    expect(tagsForGlobal('emerging-artists-prize')).toEqual([CMS_TAGS.emergingArtistsPrize])
    expect(tagsForGlobal('summit')).toEqual([CMS_TAGS.summit])
  })

  it('includes the media tag for press so image edits refresh the list', () => {
    expect(tagsForGlobal('press')).toEqual([CMS_TAGS.press, CMS_TAGS.media])
  })
})

describe('tagsForEdition', () => {
  it('tags the year page and the editions list', () => {
    expect(tagsForEdition(2026)).toEqual([CMS_TAGS.edition(2026), CMS_TAGS.editions])
  })
})

describe('tagsForRecipient', () => {
  it('tags the recipient, parent edition, and media', () => {
    expect(tagsForRecipient(2026, 'ada-lovelace')).toEqual([
      CMS_TAGS.recipient(2026, 'ada-lovelace'),
      CMS_TAGS.edition(2026),
      CMS_TAGS.media,
    ])
  })
})
