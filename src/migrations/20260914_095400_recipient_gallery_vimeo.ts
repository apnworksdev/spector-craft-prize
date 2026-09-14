import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "prize_recipients_gallery" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "prize_recipients_gallery" ADD COLUMN "vimeo_url" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "prize_recipients_gallery" DROP COLUMN "vimeo_url";
  ALTER TABLE "prize_recipients_gallery" ALTER COLUMN "image_id" SET NOT NULL;
  `)
}
