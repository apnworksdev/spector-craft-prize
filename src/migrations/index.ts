import * as migration_20260907_134303 from './20260907_134303';
import * as migration_20260908_113451_terms_and_privacy from './20260908_113451_terms_and_privacy';
import * as migration_20260909_101059_media_links from './20260909_101059_media_links';
import * as migration_20260911_124958_youtube_embeds from './20260911_124958_youtube_embeds';
import * as migration_20260914_081700_youtube_to_vimeo from './20260914_081700_youtube_to_vimeo';
import * as migration_20260914_095400_recipient_gallery_vimeo from './20260914_095400_recipient_gallery_vimeo';
import * as migration_20260914_101500_navigation from './20260914_101500_navigation';
import * as migration_20260914_102200_documents from './20260914_102200_documents';
import * as migration_20260914_110000_documents_prefix from './20260914_110000_documents_prefix';
import * as migration_20260914_141100_recipient_article_blocks from './20260914_141100_recipient_article_blocks';
import * as migration_20260915_103000_summit_people from './20260915_103000_summit_people';
import * as migration_20260915_170800_footer_credits from './20260915_170800_footer_credits';
import * as migration_20260916_141800_banner_vimeo_mobile from './20260916_141800_banner_vimeo_mobile';
import * as migration_20260916_173400_quote_richtext from './20260916_173400_quote_richtext';
import * as migration_20261016_110000_press_intro from './20261016_110000_press_intro';
import * as migration_20261026_120000_portal_schema from './20261026_120000_portal_schema';
import * as migration_20261027_130000_practice_began_details from './20261027_130000_practice_began_details';
import * as migration_20261029_120000_program_welcome_fields from './20261029_120000_program_welcome_fields';
import * as migration_20261029_121000_practice_began from './20261029_121000_practice_began';
import * as migration_20261029_140000_announcement_bar from './20261029_140000_announcement_bar';

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
  {
    up: migration_20260914_141100_recipient_article_blocks.up,
    down: migration_20260914_141100_recipient_article_blocks.down,
    name: '20260914_141100_recipient_article_blocks',
  },
  {
    up: migration_20260915_103000_summit_people.up,
    down: migration_20260915_103000_summit_people.down,
    name: '20260915_103000_summit_people',
  },
  {
    up: migration_20260915_170800_footer_credits.up,
    down: migration_20260915_170800_footer_credits.down,
    name: '20260915_170800_footer_credits',
  },
  {
    up: migration_20260916_141800_banner_vimeo_mobile.up,
    down: migration_20260916_141800_banner_vimeo_mobile.down,
    name: '20260916_141800_banner_vimeo_mobile',
  },
  {
    up: migration_20260916_173400_quote_richtext.up,
    down: migration_20260916_173400_quote_richtext.down,
    name: '20260916_173400_quote_richtext',
  },
  {
    up: migration_20261016_110000_press_intro.up,
    down: migration_20261016_110000_press_intro.down,
    name: '20261016_110000_press_intro',
  },
  {
    up: migration_20261026_120000_portal_schema.up,
    down: migration_20261026_120000_portal_schema.down,
    name: '20261026_120000_portal_schema',
  },
  {
    up: migration_20261027_130000_practice_began_details.up,
    down: migration_20261027_130000_practice_began_details.down,
    name: '20261027_130000_practice_began_details',
  },
  {
    up: migration_20261029_120000_program_welcome_fields.up,
    down: migration_20261029_120000_program_welcome_fields.down,
    name: '20261029_120000_program_welcome_fields',
  },
  {
    up: migration_20261029_121000_practice_began.up,
    down: migration_20261029_121000_practice_began.down,
    name: '20261029_121000_practice_began',
  },
  {
    up: migration_20261029_140000_announcement_bar.up,
    down: migration_20261029_140000_announcement_bar.down,
    name: '20261029_140000_announcement_bar',
  },
];
