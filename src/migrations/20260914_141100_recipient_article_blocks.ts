import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Replace prize recipient `content` + `gallery` with ordered `article` blocks
 * (text | media). Desktop still splits text left / media right; mobile follows
 * CMS order.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "prize_recipients_blocks_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "content" jsonb NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "prize_recipients_blocks_media" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "vimeo_url" varchar,
    "link" varchar,
    "block_name" varchar
  );

  DO $$ BEGIN
    ALTER TABLE "prize_recipients_blocks_text"
      ADD CONSTRAINT "prize_recipients_blocks_text_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."prize_recipients"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "prize_recipients_blocks_media"
      ADD CONSTRAINT "prize_recipients_blocks_media_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."prize_recipients"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "prize_recipients_blocks_media"
      ADD CONSTRAINT "prize_recipients_blocks_media_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_text_order_idx"
    ON "prize_recipients_blocks_text" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_text_parent_id_idx"
    ON "prize_recipients_blocks_text" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_text_path_idx"
    ON "prize_recipients_blocks_text" USING btree ("_path");

  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_media_order_idx"
    ON "prize_recipients_blocks_media" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_media_parent_id_idx"
    ON "prize_recipients_blocks_media" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_media_path_idx"
    ON "prize_recipients_blocks_media" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "prize_recipients_blocks_media_image_idx"
    ON "prize_recipients_blocks_media" USING btree ("image_id");

  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'prize_recipients'
        AND column_name = 'content'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'prize_recipients_gallery'
    ) THEN
      INSERT INTO "prize_recipients_blocks_text" ("_order", "_parent_id", "_path", "id", "content")
      SELECT
        0,
        pr."id",
        'article',
        'migrated-text-' || pr."id"::text,
        pr."content"
      FROM "prize_recipients" pr
      WHERE pr."content" IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM "prize_recipients_blocks_text" t WHERE t."_parent_id" = pr."id"
        )
        AND NOT EXISTS (
          SELECT 1 FROM "prize_recipients_blocks_media" m WHERE m."_parent_id" = pr."id"
        );

      INSERT INTO "prize_recipients_blocks_media" (
        "_order", "_parent_id", "_path", "id", "image_id", "vimeo_url", "link"
      )
      SELECT
        CASE WHEN pr."content" IS NOT NULL THEN g."_order" + 1 ELSE g."_order" END,
        g."_parent_id",
        'article',
        g."id",
        g."image_id",
        g."vimeo_url",
        g."link"
      FROM "prize_recipients_gallery" g
      JOIN "prize_recipients" pr ON pr."id" = g."_parent_id"
      WHERE NOT EXISTS (
        SELECT 1 FROM "prize_recipients_blocks_media" m WHERE m."_parent_id" = g."_parent_id"
      );

      ALTER TABLE "prize_recipients" DROP COLUMN IF EXISTS "content";
      DROP TABLE IF EXISTS "prize_recipients_gallery" CASCADE;
    END IF;
  END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "prize_recipients_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "vimeo_url" varchar,
    "link" varchar
  );

  DO $$ BEGIN
    ALTER TABLE "prize_recipients_gallery"
      ADD CONSTRAINT "prize_recipients_gallery_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."prize_recipients"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END $$;

  ALTER TABLE "prize_recipients" ADD COLUMN IF NOT EXISTS "content" jsonb;

  INSERT INTO "prize_recipients_gallery" ("_order", "_parent_id", "id", "image_id", "vimeo_url", "link")
  SELECT
    ROW_NUMBER() OVER (PARTITION BY "_parent_id" ORDER BY "_order") - 1,
    "_parent_id",
    "id",
    "image_id",
    "vimeo_url",
    "link"
  FROM "prize_recipients_blocks_media"
  ON CONFLICT ("id") DO NOTHING;

  UPDATE "prize_recipients" pr
  SET "content" = t."content"
  FROM "prize_recipients_blocks_text" t
  WHERE t."_parent_id" = pr."id"
    AND t."_order" = (
      SELECT MIN(t2."_order") FROM "prize_recipients_blocks_text" t2 WHERE t2."_parent_id" = pr."id"
    )
    AND pr."content" IS NULL;

  DROP TABLE IF EXISTS "prize_recipients_blocks_text" CASCADE;
  DROP TABLE IF EXISTS "prize_recipients_blocks_media" CASCADE;
  `)
}
