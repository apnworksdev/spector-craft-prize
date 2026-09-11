import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editions_blocks_banner" ALTER COLUMN "media_id" DROP NOT NULL;
  ALTER TABLE "home_blocks_banner" ALTER COLUMN "media_id" DROP NOT NULL;
  ALTER TABLE "editions_blocks_banner" ADD COLUMN "youtube_url" varchar;
  ALTER TABLE "editions_blocks_media_columns_columns" ADD COLUMN "youtube_url" varchar;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "youtube_url" varchar;
  ALTER TABLE "home_blocks_media_columns_columns" ADD COLUMN "youtube_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editions_blocks_banner" ALTER COLUMN "media_id" SET NOT NULL;
  ALTER TABLE "home_blocks_banner" ALTER COLUMN "media_id" SET NOT NULL;
  ALTER TABLE "editions_blocks_banner" DROP COLUMN "youtube_url";
  ALTER TABLE "editions_blocks_media_columns_columns" DROP COLUMN "youtube_url";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "youtube_url";
  ALTER TABLE "home_blocks_media_columns_columns" DROP COLUMN "youtube_url";`)
}
