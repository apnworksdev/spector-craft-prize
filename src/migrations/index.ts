import * as migration_20260907_134303 from './20260907_134303';
import * as migration_20260908_113451_terms_and_privacy from './20260908_113451_terms_and_privacy';
import * as migration_20260909_101059_media_links from './20260909_101059_media_links';
import * as migration_20260911_124958_youtube_embeds from './20260911_124958_youtube_embeds';
import * as migration_20260914_081700_youtube_to_vimeo from './20260914_081700_youtube_to_vimeo';
import * as migration_20260914_095400_recipient_gallery_vimeo from './20260914_095400_recipient_gallery_vimeo';
import * as migration_20260914_101500_navigation from './20260914_101500_navigation';
import * as migration_20260914_102200_documents from './20260914_102200_documents';
import * as migration_20260914_110000_documents_prefix from './20260914_110000_documents_prefix';

export const migrations = [
  {
    up: migration_20260907_134303.up,
    down: migration_20260907_134303.down,
    name: '20260907_134303',
  },
  {
    up: migration_20260908_113451_terms_and_privacy.up,
    down: migration_20260908_113451_terms_and_privacy.down,
    name: '20260908_113451_terms_and_privacy',
  },
  {
    up: migration_20260909_101059_media_links.up,
    down: migration_20260909_101059_media_links.down,
    name: '20260909_101059_media_links',
  },
  {
    up: migration_20260911_124958_youtube_embeds.up,
    down: migration_20260911_124958_youtube_embeds.down,
    name: '20260911_124958_youtube_embeds',
  },
  {
    up: migration_20260914_081700_youtube_to_vimeo.up,
    down: migration_20260914_081700_youtube_to_vimeo.down,
    name: '20260914_081700_youtube_to_vimeo',
  },
  {
    up: migration_20260914_095400_recipient_gallery_vimeo.up,
    down: migration_20260914_095400_recipient_gallery_vimeo.down,
    name: '20260914_095400_recipient_gallery_vimeo',
  },
  {
    up: migration_20260914_101500_navigation.up,
    down: migration_20260914_101500_navigation.down,
    name: '20260914_101500_navigation',
  },
  {
    up: migration_20260914_102200_documents.up,
    down: migration_20260914_102200_documents.down,
    name: '20260914_102200_documents',
  },
  {
    up: migration_20260914_110000_documents_prefix.up,
    down: migration_20260914_110000_documents_prefix.down,
    name: '20260914_110000_documents_prefix',
  },
]
