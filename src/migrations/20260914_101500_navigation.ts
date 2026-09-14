import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "navigation_header" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "navigation_footer_primary" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "navigation_footer_legal" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar NOT NULL,
    "url" varchar NOT NULL,
    "open_in_new_tab" boolean DEFAULT false
  );

  CREATE TABLE "navigation" (
    "id" serial PRIMARY KEY NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "navigation_header" ADD CONSTRAINT "navigation_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_primary" ADD CONSTRAINT "navigation_footer_primary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_legal" ADD CONSTRAINT "navigation_footer_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;

  CREATE INDEX "navigation_header_order_idx" ON "navigation_header" USING btree ("_order");
  CREATE INDEX "navigation_header_parent_id_idx" ON "navigation_header" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_primary_order_idx" ON "navigation_footer_primary" USING btree ("_order");
  CREATE INDEX "navigation_footer_primary_parent_id_idx" ON "navigation_footer_primary" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_legal_order_idx" ON "navigation_footer_legal" USING btree ("_order");
  CREATE INDEX "navigation_footer_legal_parent_id_idx" ON "navigation_footer_legal" USING btree ("_parent_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "navigation_header" CASCADE;
  DROP TABLE "navigation_footer_primary" CASCADE;
  DROP TABLE "navigation_footer_legal" CASCADE;
  DROP TABLE "navigation" CASCADE;
  `)
}
