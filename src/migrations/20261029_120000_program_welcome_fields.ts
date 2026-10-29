import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "welcome_title" varchar;

  CREATE TABLE IF NOT EXISTS "programs_selection_criteria" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "body" varchar NOT NULL
  );

  DO $$ BEGIN
    ALTER TABLE "programs_selection_criteria"
      ADD CONSTRAINT "programs_selection_criteria_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  CREATE INDEX IF NOT EXISTS "programs_selection_criteria_order_idx"
    ON "programs_selection_criteria" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "programs_selection_criteria_parent_id_idx"
    ON "programs_selection_criteria" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "programs_selection_criteria" CASCADE;
  ALTER TABLE "programs" DROP COLUMN IF EXISTS "welcome_title";
  `)
}
