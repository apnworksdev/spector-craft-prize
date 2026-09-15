import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "summit_people" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "name" varchar NOT NULL,
    "title" varchar,
    "bio" jsonb
  );

  DO $$ BEGIN
    ALTER TABLE "summit_people"
      ADD CONSTRAINT "summit_people_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."summit"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "summit_people"
      ADD CONSTRAINT "summit_people_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "summit_people_order_idx" ON "summit_people" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "summit_people_parent_id_idx" ON "summit_people" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "summit_people_image_idx" ON "summit_people" USING btree ("image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "summit_people" CASCADE;
  `)
}
