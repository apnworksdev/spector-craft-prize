import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "press" ADD COLUMN IF NOT EXISTS "inquiry_email" varchar;
  ALTER TABLE "press" ADD COLUMN IF NOT EXISTS "press_release_label" varchar;
  ALTER TABLE "press" ADD COLUMN IF NOT EXISTS "press_release_id" integer;

  DO $$ BEGIN
    ALTER TABLE "press"
      ADD CONSTRAINT "press_press_release_id_documents_id_fk"
      FOREIGN KEY ("press_release_id") REFERENCES "public"."documents"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  CREATE INDEX IF NOT EXISTS "press_press_release_idx" ON "press" USING btree ("press_release_id");

  UPDATE "press"
  SET "inquiry_email" = 'spectorcraftprize@dadagoldberg.com'
  WHERE "inquiry_email" IS NULL;

  UPDATE "press"
  SET "press_release_label" = 'Spector Craft Prize Press Release'
  WHERE "press_release_label" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "press" DROP CONSTRAINT IF EXISTS "press_press_release_id_documents_id_fk";
  DROP INDEX IF EXISTS "press_press_release_idx";
  ALTER TABLE "press" DROP COLUMN IF EXISTS "press_release_id";
  ALTER TABLE "press" DROP COLUMN IF EXISTS "press_release_label";
  ALTER TABLE "press" DROP COLUMN IF EXISTS "inquiry_email";
  `)
}
