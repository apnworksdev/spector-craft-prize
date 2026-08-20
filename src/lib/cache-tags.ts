export const CMS_TAGS = {
  home: 'cms:home',
  about: 'cms:about',
  press: 'cms:press',
  emergingArtistsPrize: 'cms:emerging-artists-prize',
  editions: 'cms:editions',
  media: 'cms:media',
  edition: (year: number) => `cms:edition:${year}`,
  recipient: (year: number, slug: string) => `cms:recipient:${year}:${slug}`,
} as const

export type GlobalSlug = 'home' | 'about' | 'press' | 'emerging-artists-prize'

export function tagsForGlobal(slug: GlobalSlug): string[] {
  switch (slug) {
    case 'home':
      return [CMS_TAGS.home]
    case 'about':
      return [CMS_TAGS.about]
    case 'press':
      return [CMS_TAGS.press, CMS_TAGS.media]
    case 'emerging-artists-prize':
      return [CMS_TAGS.emergingArtistsPrize]
  }
}

export function tagsForEdition(year: number): string[] {
  return [CMS_TAGS.edition(year), CMS_TAGS.editions]
}

export function tagsForRecipient(year: number, slug: string): string[] {
  return [CMS_TAGS.recipient(year, slug), CMS_TAGS.edition(year), CMS_TAGS.media]
}
