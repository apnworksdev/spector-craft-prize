import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "prefix" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "url" varchar,
    "thumbnail_u_r_l" varchar,
    "filename" varchar,
    "mime_type" varchar,
    "filesize" numeric,
    "width" numeric,
    "height" numeric,
    "focal_x" numeric,
    "focal_y" numeric
  );

  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");

  ALTER TABLE "navigation_header" ADD COLUMN "file_id" integer;
  ALTER TABLE "navigation_footer_primary" ADD COLUMN "file_id" integer;
  ALTER TABLE "navigation_footer_legal" ADD COLUMN "file_id" integer;
  ALTER TABLE "navigation_header" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "navigation_footer_primary" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "navigation_footer_legal" ALTER COLUMN "url" DROP NOT NULL;

  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_primary" ADD CONSTRAINT "navigation_footer_primary_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_legal" ADD CONSTRAINT "navigation_footer_legal_file_id_documents_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "navigation_header_file_idx" ON "navigation_header" USING btree ("file_id");
  CREATE INDEX "navigation_footer_primary_file_idx" ON "navigation_footer_primary" USING btree ("file_id");
  CREATE INDEX "navigation_footer_legal_file_idx" ON "navigation_footer_legal" USING btree ("file_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "navigation_header" DROP CONSTRAINT "navigation_header_file_id_documents_id_fk";
  ALTER TABLE "navigation_footer_primary" DROP CONSTRAINT "navigation_footer_primary_file_id_documents_id_fk";
  ALTER TABLE "navigation_footer_legal" DROP CONSTRAINT "navigation_footer_legal_file_id_documents_id_fk";
  DROP INDEX IF EXISTS "navigation_header_file_idx";
  DROP INDEX IF EXISTS "navigation_footer_primary_file_idx";
  DROP INDEX IF EXISTS "navigation_footer_legal_file_idx";
  ALTER TABLE "navigation_header" DROP COLUMN "file_id";
  ALTER TABLE "navigation_footer_primary" DROP COLUMN "file_id";
  ALTER TABLE "navigation_footer_legal" DROP COLUMN "file_id";
  ALTER TABLE "navigation_header" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "navigation_footer_primary" ALTER COLUMN "url" SET NOT NULL;
  ALTER TABLE "navigation_footer_legal" ALTER COLUMN "url" SET NOT NULL;
  DROP TABLE "documents" CASCADE;
  `)
}
