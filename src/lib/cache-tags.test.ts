import { describe, expect, it } from 'vitest'

import {
  CMS_TAGS,
  pathsForGlobal,
  pathsForRecipient,
  tagsForEdition,
  tagsForGlobal,
  tagsForRecipient,
} from '@/lib/cache-tags'

describe('tagsForGlobal', () => {
  it('returns a dedicated tag for each singleton page', () => {
    expect(tagsForGlobal('home')).toEqual([CMS_TAGS.home, CMS_TAGS.media])
    expect(tagsForGlobal('about')).toEqual([CMS_TAGS.about, CMS_TAGS.media])
    expect(tagsForGlobal('emerging-artists-prize')).toEqual([
      CMS_TAGS.emergingArtistsPrize,
      CMS_TAGS.media,
    ])
    expect(tagsForGlobal('summit')).toEqual([CMS_TAGS.summit, CMS_TAGS.media])
    expect(tagsForGlobal('terms')).toEqual([CMS_TAGS.terms])
    expect(tagsForGlobal('privacy')).toEqual([CMS_TAGS.privacy])
    expect(tagsForGlobal('navigation')).toEqual([CMS_TAGS.navigation, CMS_TAGS.documents])
  })

  it('includes the media tag for press so image edits refresh the list', () => {
    expect(tagsForGlobal('press')).toEqual([CMS_TAGS.press, CMS_TAGS.media])
  })
})

describe('tagsForEdition', () => {
  it('tags the year page and the editions list', () => {
    expect(tagsForEdition(2026)).toEqual([CMS_TAGS.edition(2026), CMS_TAGS.editions, CMS_TAGS.media])
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

describe('pathsForGlobal', () => {
  it('maps each singleton to its public URL', () => {
    expect(pathsForGlobal('home')).toEqual([{ path: '/' }])
    expect(pathsForGlobal('about')).toEqual([{ path: '/about' }])
    expect(pathsForGlobal('press')).toEqual([{ path: '/press' }])
    expect(pathsForGlobal('emerging-artists-prize')).toEqual([{ path: '/emerging-artists-prize' }])
    expect(pathsForGlobal('summit')).toEqual([{ path: '/summit' }])
    expect(pathsForGlobal('terms')).toEqual([{ path: '/terms' }])
    expect(pathsForGlobal('privacy')).toEqual([{ path: '/privacy' }])
  })

  it('busts the whole site layout when navigation changes', () => {
    expect(pathsForGlobal('navigation')).toEqual([{ path: '/', type: 'layout' }])
  })
})

describe('pathsForRecipient', () => {
  it('includes the recipient page and its edition index', () => {
    expect(pathsForRecipient(2026, 'sharif-bey')).toEqual([
      { path: '/2026-prize-recipients/sharif-bey' },
      { path: '/2026-prize-recipients' },
    ])
  })
})
