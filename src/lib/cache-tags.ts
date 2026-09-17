export const CMS_TAGS = {
  home: 'cms:home',
  about: 'cms:about',
  press: 'cms:press',
  emergingArtistsPrize: 'cms:emerging-artists-prize',
  summit: 'cms:summit',
  terms: 'cms:terms',
  privacy: 'cms:privacy',
  navigation: 'cms:navigation',
  documents: 'cms:documents',
  editions: 'cms:editions',
  media: 'cms:media',
  edition: (year: number) => `cms:edition:${year}`,
  recipient: (year: number, slug: string) => `cms:recipient:${year}:${slug}`,
} as const

export type GlobalSlug =
  | 'home'
  | 'about'
  | 'press'
  | 'emerging-artists-prize'
  | 'summit'
  | 'terms'
  | 'privacy'
  | 'navigation'

export function tagsForGlobal(slug: GlobalSlug): string[] {
  switch (slug) {
    case 'home':
      return [CMS_TAGS.home, CMS_TAGS.media]
    case 'about':
      return [CMS_TAGS.about, CMS_TAGS.media]
    case 'press':
      return [CMS_TAGS.press, CMS_TAGS.media]
    case 'emerging-artists-prize':
      return [CMS_TAGS.emergingArtistsPrize, CMS_TAGS.media]
    case 'summit':
      return [CMS_TAGS.summit, CMS_TAGS.media]
    case 'terms':
      return [CMS_TAGS.terms]
    case 'privacy':
      return [CMS_TAGS.privacy]
    case 'navigation':
      return [CMS_TAGS.navigation, CMS_TAGS.documents]
  }
}

export function tagsForEdition(year: number): string[] {
  return [CMS_TAGS.edition(year), CMS_TAGS.editions, CMS_TAGS.media]
}

export function tagsForRecipient(year: number, slug: string): string[] {
  return [CMS_TAGS.recipient(year, slug), CMS_TAGS.edition(year), CMS_TAGS.media]
}
