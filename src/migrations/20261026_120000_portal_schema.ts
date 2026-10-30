import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the apply/jury schema on top of the existing public site.
 * Does not change home, about, press, editions, recipients, media, or documents rows.
 * Safe to run again on a database that already has these tables (portal dev).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'juror');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_programs_status" AS ENUM('draft', 'live', 'closed');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_applications_status" AS ENUM('draft', 'submitted');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_applications_us_citizen_or_resident" AS ENUM('yes', 'no');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "public"."enum_submission_files_kind" AS ENUM('image', 'video', 'id');
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;

  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "list_title" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar DEFAULT '';
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar DEFAULT '';
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "enum_users_role" DEFAULT 'admin' NOT NULL;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "can_jury" boolean DEFAULT false;

  CREATE TABLE IF NOT EXISTS "programs" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "code" varchar,
    "deadline" timestamp(3) with time zone NOT NULL,
    "status" "enum_programs_status" DEFAULT 'draft' NOT NULL,
    "welcome_title" varchar,
    "welcome_message" varchar NOT NULL,
    "rules_document_id" integer,
    "help_message" varchar NOT NULL,
    "incomplete_message" varchar NOT NULL,
    "ready_to_submit_message" varchar NOT NULL,
    "confirmation_email_body" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "programs_declarations" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "text" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "programs_selection_criteria" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "body" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "applicants" (
    "id" serial PRIMARY KEY NOT NULL,
    "list_title" varchar,
    "slug" varchar,
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "_verified" boolean,
    "_verificationtoken" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE IF NOT EXISTS "applicants_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "submission_files" (
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum_submission_files_kind" NOT NULL,
    "applicant_id" integer NOT NULL,
    "application_id" integer,
    "prefix" varchar DEFAULT 'submissions',
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

  CREATE TABLE IF NOT EXISTS "applications" (
    "id" serial PRIMARY KEY NOT NULL,
    "panel_median" numeric,
    "selected_for_evaluation" boolean DEFAULT false,
    "evaluation_count" numeric DEFAULT 0,
    "list_title" varchar,
    "slug" varchar,
    "applicant_id" integer NOT NULL,
    "program_id" integer NOT NULL,
    "status" "enum_applications_status" DEFAULT 'draft' NOT NULL,
    "submitted_at" timestamp(3) with time zone,
    "full_name" varchar,
    "artist_name" varchar,
    "date_of_birth" timestamp(3) with time zone,
    "address_line1" varchar,
    "address_line2" varchar,
    "city" varchar,
    "state" varchar,
    "postal_code" varchar,
    "country" varchar,
    "phone" varchar,
    "email" varchar,
    "website" varchar,
    "social_media" varchar,
    "personal_notes" varchar,
    "years_of_practice" varchar,
    "practice_began" varchar,
    "practice_began_details" varchar,
    "training_background" varchar,
    "primary_craft_discipline" varchar,
    "us_citizen_or_resident" "enum_applications_us_citizen_or_resident",
    "eligibility_notes" varchar,
    "educational_background" varchar,
    "recent_exhibitions" varchar,
    "awards_recognition" varchar,
    "biographical_summary" varchar,
    "work_title" varchar,
    "work_year_created" varchar,
    "work_dimensions" varchar,
    "work_materials" varchar,
    "artist_statement" varchar,
    "work_description" varchar,
    "work_significance" varchar,
    "why_prize" varchar,
    "work_video_id" integer,
    "government_id_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "applications_declarations_accepted" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "accepted" boolean
  );

  CREATE TABLE IF NOT EXISTS "applications_portfolio_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "file_id" integer NOT NULL,
    "title" varchar NOT NULL,
    "year_created" varchar NOT NULL,
    "materials" varchar NOT NULL,
    "dimensions" varchar NOT NULL,
    "additional_details" varchar,
    "set_id" varchar
  );

  CREATE TABLE IF NOT EXISTS "applications_work_images" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "file_id" integer NOT NULL,
    "title" varchar NOT NULL,
    "year_created" varchar NOT NULL,
    "materials" varchar NOT NULL,
    "dimensions" varchar NOT NULL,
    "additional_details" varchar,
    "set_id" varchar
  );

  CREATE TABLE IF NOT EXISTS "evaluations" (
    "id" serial PRIMARY KEY NOT NULL,
    "list_title" varchar,
    "slug" varchar,
    "application_id" integer NOT NULL,
    "juror_id" integer NOT NULL,
    "artistic_excellence" numeric NOT NULL,
    "cultural_significance" numeric NOT NULL,
    "growth_potential" numeric NOT NULL,
    "mission_alignment" numeric NOT NULL,
    "total" numeric,
    "notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

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

  CREATE UNIQUE INDEX IF NOT EXISTS "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "programs_code_idx" ON "programs" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "programs_rules_document_idx" ON "programs" USING btree ("rules_document_id");
  CREATE INDEX IF NOT EXISTS "programs_declarations_order_idx" ON "programs_declarations" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "programs_declarations_parent_id_idx" ON "programs_declarations" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "programs_selection_criteria_order_idx" ON "programs_selection_criteria" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "programs_selection_criteria_parent_id_idx" ON "programs_selection_criteria" USING btree ("_parent_id");

  CREATE UNIQUE INDEX IF NOT EXISTS "applicants_email_idx" ON "applicants" USING btree ("email");
  CREATE UNIQUE INDEX IF NOT EXISTS "applicants_slug_idx" ON "applicants" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "applicants_created_at_idx" ON "applicants" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "applicants_updated_at_idx" ON "applicants" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "applicants_sessions_order_idx" ON "applicants_sessions" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "applicants_sessions_parent_id_idx" ON "applicants_sessions" USING btree ("_parent_id");

  CREATE UNIQUE INDEX IF NOT EXISTS "submission_files_filename_idx" ON "submission_files" USING btree ("filename");
  CREATE INDEX IF NOT EXISTS "submission_files_applicant_idx" ON "submission_files" USING btree ("applicant_id");
  CREATE INDEX IF NOT EXISTS "submission_files_application_idx" ON "submission_files" USING btree ("application_id");
  CREATE INDEX IF NOT EXISTS "submission_files_created_at_idx" ON "submission_files" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "submission_files_updated_at_idx" ON "submission_files" USING btree ("updated_at");

  CREATE UNIQUE INDEX IF NOT EXISTS "applications_slug_idx" ON "applications" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "applicant_program_idx" ON "applications" USING btree ("applicant_id", "program_id");
  CREATE INDEX IF NOT EXISTS "applications_applicant_idx" ON "applications" USING btree ("applicant_id");
  CREATE INDEX IF NOT EXISTS "applications_program_idx" ON "applications" USING btree ("program_id");
  CREATE INDEX IF NOT EXISTS "applications_government_id_idx" ON "applications" USING btree ("government_id_id");
  CREATE INDEX IF NOT EXISTS "applications_work_video_idx" ON "applications" USING btree ("work_video_id");
  CREATE INDEX IF NOT EXISTS "applications_created_at_idx" ON "applications" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "applications_updated_at_idx" ON "applications" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "applications_declarations_accepted_order_idx" ON "applications_declarations_accepted" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "applications_declarations_accepted_parent_id_idx" ON "applications_declarations_accepted" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "applications_portfolio_images_order_idx" ON "applications_portfolio_images" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "applications_portfolio_images_parent_id_idx" ON "applications_portfolio_images" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "applications_portfolio_images_file_idx" ON "applications_portfolio_images" USING btree ("file_id");
  CREATE INDEX IF NOT EXISTS "applications_work_images_order_idx" ON "applications_work_images" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "applications_work_images_parent_id_idx" ON "applications_work_images" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "applications_work_images_file_idx" ON "applications_work_images" USING btree ("file_id");

  CREATE UNIQUE INDEX IF NOT EXISTS "evaluations_slug_idx" ON "evaluations" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "application_juror_idx" ON "evaluations" USING btree ("application_id", "juror_id");
  CREATE INDEX IF NOT EXISTS "evaluations_application_idx" ON "evaluations" USING btree ("application_id");
  CREATE INDEX IF NOT EXISTS "evaluations_juror_idx" ON "evaluations" USING btree ("juror_id");
  CREATE INDEX IF NOT EXISTS "evaluations_created_at_idx" ON "evaluations" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "evaluations_updated_at_idx" ON "evaluations" USING btree ("updated_at");

  DO $$ BEGIN
    ALTER TABLE "programs_declarations"
      ADD CONSTRAINT "programs_declarations_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "programs_selection_criteria"
      ADD CONSTRAINT "programs_selection_criteria_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "programs"
      ADD CONSTRAINT "programs_rules_document_id_documents_id_fk"
      FOREIGN KEY ("rules_document_id") REFERENCES "public"."documents"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applicants_sessions"
      ADD CONSTRAINT "applicants_sessions_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."applicants"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "submission_files"
      ADD CONSTRAINT "submission_files_applicant_id_applicants_id_fk"
      FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "submission_files"
      ADD CONSTRAINT "submission_files_application_id_applications_id_fk"
      FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications"
      ADD CONSTRAINT "applications_applicant_id_applicants_id_fk"
      FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications"
      ADD CONSTRAINT "applications_program_id_programs_id_fk"
      FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications"
      ADD CONSTRAINT "applications_government_id_id_submission_files_id_fk"
      FOREIGN KEY ("government_id_id") REFERENCES "public"."submission_files"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications"
      ADD CONSTRAINT "applications_work_video_id_submission_files_id_fk"
      FOREIGN KEY ("work_video_id") REFERENCES "public"."submission_files"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications_declarations_accepted"
      ADD CONSTRAINT "applications_declarations_accepted_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications_portfolio_images"
      ADD CONSTRAINT "applications_portfolio_images_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications_portfolio_images"
      ADD CONSTRAINT "applications_portfolio_images_file_id_submission_files_id_fk"
      FOREIGN KEY ("file_id") REFERENCES "public"."submission_files"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications_work_images"
      ADD CONSTRAINT "applications_work_images_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."applications"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "applications_work_images"
      ADD CONSTRAINT "applications_work_images_file_id_submission_files_id_fk"
      FOREIGN KEY ("file_id") REFERENCES "public"."submission_files"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "evaluations"
      ADD CONSTRAINT "evaluations_application_id_applications_id_fk"
      FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "evaluations"
      ADD CONSTRAINT "evaluations_juror_id_users_id_fk"
      FOREIGN KEY ("juror_id") REFERENCES "public"."users"("id")
      ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "applicants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "applications_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "evaluations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "programs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "submission_files_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "applicants_id" integer;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_applicants_fk"
      FOREIGN KEY ("applicants_id") REFERENCES "public"."applicants"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_applications_fk"
      FOREIGN KEY ("applications_id") REFERENCES "public"."applications"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_evaluations_fk"
      FOREIGN KEY ("evaluations_id") REFERENCES "public"."evaluations"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_programs_fk"
      FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_submission_files_fk"
      FOREIGN KEY ("submission_files_id") REFERENCES "public"."submission_files"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels"
      ADD CONSTRAINT "payload_preferences_rels_applicants_fk"
      FOREIGN KEY ("applicants_id") REFERENCES "public"."applicants"("id")
      ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_applicants_id_idx" ON "payload_locked_documents_rels" USING btree ("applicants_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_applications_id_idx" ON "payload_locked_documents_rels" USING btree ("applications_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_evaluations_id_idx" ON "payload_locked_documents_rels" USING btree ("evaluations_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_submission_files_id_idx" ON "payload_locked_documents_rels" USING btree ("submission_files_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_applicants_id_idx" ON "payload_preferences_rels" USING btree ("applicants_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT IF EXISTS "payload_preferences_rels_applicants_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_submission_files_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_programs_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_evaluations_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_applications_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_applicants_fk";

  DROP INDEX IF EXISTS "payload_preferences_rels_applicants_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_submission_files_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_programs_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_evaluations_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_applications_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_applicants_id_idx";

  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "applicants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "submission_files_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "programs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "evaluations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "applications_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "applicants_id";

  DROP TABLE IF EXISTS "evaluations" CASCADE;
  DROP TABLE IF EXISTS "applications_work_images" CASCADE;
  DROP TABLE IF EXISTS "applications_portfolio_images" CASCADE;
  DROP TABLE IF EXISTS "applications_declarations_accepted" CASCADE;
  DROP TABLE IF EXISTS "applications" CASCADE;
  DROP TABLE IF EXISTS "submission_files" CASCADE;
  DROP TABLE IF EXISTS "applicants_sessions" CASCADE;
  DROP TABLE IF EXISTS "applicants" CASCADE;
  DROP TABLE IF EXISTS "programs_selection_criteria" CASCADE;
  DROP TABLE IF EXISTS "programs_declarations" CASCADE;
  DROP TABLE IF EXISTS "programs" CASCADE;
  DROP TABLE IF EXISTS "announcement_bar" CASCADE;

  ALTER TABLE "users" DROP COLUMN IF EXISTS "can_jury";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "last_name";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "first_name";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "list_title";

  DROP TYPE IF EXISTS "public"."enum_submission_files_kind";
  DROP TYPE IF EXISTS "public"."enum_applications_us_citizen_or_resident";
  DROP TYPE IF EXISTS "public"."enum_applications_status";
  DROP TYPE IF EXISTS "public"."enum_programs_status";
  DROP TYPE IF EXISTS "public"."enum_users_role";
  `)
}
