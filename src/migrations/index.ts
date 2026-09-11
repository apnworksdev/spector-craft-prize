import * as migration_20260907_134303 from './20260907_134303';
import * as migration_20260908_113451_terms_and_privacy from './20260908_113451_terms_and_privacy';
import * as migration_20260909_101059_media_links from './20260909_101059_media_links';
import * as migration_20260911_124958_youtube_embeds from './20260911_124958_youtube_embeds';

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
    name: '20260911_124958_youtube_embeds'
  },
];
