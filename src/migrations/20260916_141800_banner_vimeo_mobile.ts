import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_blocks_banner" ADD COLUMN IF NOT EXISTS "vimeo_url_mobile" varchar;
  ALTER TABLE "editions_blocks_banner" ADD COLUMN IF NOT EXISTS "vimeo_url_mobile" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_blocks_banner" DROP COLUMN IF EXISTS "vimeo_url_mobile";
  ALTER TABLE "editions_blocks_banner" DROP COLUMN IF EXISTS "vimeo_url_mobile";
  `)
}
