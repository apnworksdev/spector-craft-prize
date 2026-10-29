import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "announcement_bar" (
    "id" serial PRIMARY KEY NOT NULL,
    "active" boolean DEFAULT false,
    "text" varchar,
    "link" varchar,
    "background_color" varchar DEFAULT '#F0F0F0',
    "text_color" varchar DEFAULT '#666666',
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "announcement_bar" CASCADE;
  `)
}
