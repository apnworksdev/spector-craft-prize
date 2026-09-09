import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editions_blocks_banner" ADD COLUMN "link" varchar;
  ALTER TABLE "editions_blocks_media_columns_columns" ADD COLUMN "link" varchar;
  ALTER TABLE "prize_recipients_secondary_images" ADD COLUMN "link" varchar;
  ALTER TABLE "prize_recipients_gallery" ADD COLUMN "link" varchar;
  ALTER TABLE "prize_recipients" ADD COLUMN "main_link" varchar;
  ALTER TABLE "home_blocks_banner" ADD COLUMN "link" varchar;
  ALTER TABLE "home_blocks_media_columns_columns" ADD COLUMN "link" varchar;
  ALTER TABLE "about_blocks_person" ADD COLUMN "link" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editions_blocks_banner" DROP COLUMN "link";
  ALTER TABLE "editions_blocks_media_columns_columns" DROP COLUMN "link";
  ALTER TABLE "prize_recipients_secondary_images" DROP COLUMN "link";
  ALTER TABLE "prize_recipients_gallery" DROP COLUMN "link";
  ALTER TABLE "prize_recipients" DROP COLUMN "main_link";
  ALTER TABLE "home_blocks_banner" DROP COLUMN "link";
  ALTER TABLE "home_blocks_media_columns_columns" DROP COLUMN "link";
  ALTER TABLE "about_blocks_person" DROP COLUMN "link";`)
}
