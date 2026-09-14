import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "editions_blocks_banner" RENAME COLUMN "youtube_url" TO "vimeo_url";
  ALTER TABLE "editions_blocks_media_columns_columns" RENAME COLUMN "youtube_url" TO "vimeo_url";
  ALTER TABLE "home_blocks_banner" RENAME COLUMN "youtube_url" TO "vimeo_url";
  ALTER TABLE "home_blocks_media_columns_columns" RENAME COLUMN "youtube_url" TO "vimeo_url";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "editions_blocks_banner" RENAME COLUMN "vimeo_url" TO "youtube_url";
  ALTER TABLE "editions_blocks_media_columns_columns" RENAME COLUMN "vimeo_url" TO "youtube_url";
  ALTER TABLE "home_blocks_banner" RENAME COLUMN "vimeo_url" TO "youtube_url";
  ALTER TABLE "home_blocks_media_columns_columns" RENAME COLUMN "vimeo_url" TO "youtube_url";
  `)
}
