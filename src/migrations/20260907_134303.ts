import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_editions_blocks_rich_text_width" AS ENUM('narrow', 'wide');
  CREATE TYPE "public"."enum_editions_blocks_media_columns_aspect_ratio" AS ENUM('horizontal', 'vertical');
  CREATE TYPE "public"."enum_home_blocks_rich_text_width" AS ENUM('narrow', 'wide');
  CREATE TYPE "public"."enum_home_blocks_media_columns_aspect_ratio" AS ENUM('horizontal', 'vertical');
  CREATE TYPE "public"."enum_about_blocks_person_layout" AS ENUM('inline', 'stacked');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
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
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "editions_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "editions_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_editions_blocks_rich_text_width" DEFAULT 'narrow',
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "editions_blocks_media_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"content" jsonb
  );
  
  CREATE TABLE "editions_blocks_media_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"aspect_ratio" "enum_editions_blocks_media_columns_aspect_ratio" DEFAULT 'horizontal',
  	"block_name" varchar
  );
  
  CREATE TABLE "editions_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"writer" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "editions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" numeric NOT NULL,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "prize_recipients_secondary_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "prize_recipients_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "prize_recipients" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"edition_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"location" varchar,
  	"slug" varchar NOT NULL,
  	"main_image_id" integer,
  	"main_content" jsonb,
  	"secondary_content" jsonb,
  	"content" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"editions_id" integer,
  	"prize_recipients_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_home_blocks_rich_text_width" DEFAULT 'narrow',
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_media_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"content" jsonb
  );
  
  CREATE TABLE "home_blocks_media_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"aspect_ratio" "enum_home_blocks_media_columns_aspect_ratio" DEFAULT 'horizontal',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"writer" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "about_blocks_person" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_about_blocks_person_layout" DEFAULT 'inline' NOT NULL,
  	"image_id" integer,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"bio" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "about_groups_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb
  );
  
  CREATE TABLE "about_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar
  );
  
  CREATE TABLE "about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "press_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "press" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "emerging_artists_prize" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary" jsonb,
  	"secondary" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "summit" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary" jsonb,
  	"secondary" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editions_blocks_banner" ADD CONSTRAINT "editions_blocks_banner_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editions_blocks_banner" ADD CONSTRAINT "editions_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editions_blocks_rich_text" ADD CONSTRAINT "editions_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editions_blocks_media_columns_columns" ADD CONSTRAINT "editions_blocks_media_columns_columns_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editions_blocks_media_columns_columns" ADD CONSTRAINT "editions_blocks_media_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editions_blocks_media_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editions_blocks_media_columns" ADD CONSTRAINT "editions_blocks_media_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editions_blocks_quote" ADD CONSTRAINT "editions_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prize_recipients_secondary_images" ADD CONSTRAINT "prize_recipients_secondary_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prize_recipients_secondary_images" ADD CONSTRAINT "prize_recipients_secondary_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prize_recipients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prize_recipients_gallery" ADD CONSTRAINT "prize_recipients_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prize_recipients_gallery" ADD CONSTRAINT "prize_recipients_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."prize_recipients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "prize_recipients" ADD CONSTRAINT "prize_recipients_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."editions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "prize_recipients" ADD CONSTRAINT "prize_recipients_main_image_id_media_id_fk" FOREIGN KEY ("main_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_editions_fk" FOREIGN KEY ("editions_id") REFERENCES "public"."editions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_prize_recipients_fk" FOREIGN KEY ("prize_recipients_id") REFERENCES "public"."prize_recipients"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_banner" ADD CONSTRAINT "home_blocks_banner_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_banner" ADD CONSTRAINT "home_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_rich_text" ADD CONSTRAINT "home_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_media_columns_columns" ADD CONSTRAINT "home_blocks_media_columns_columns_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_media_columns_columns" ADD CONSTRAINT "home_blocks_media_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_media_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_media_columns" ADD CONSTRAINT "home_blocks_media_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_quote" ADD CONSTRAINT "home_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_blocks_text" ADD CONSTRAINT "about_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_blocks_person" ADD CONSTRAINT "about_blocks_person_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "about_blocks_person" ADD CONSTRAINT "about_blocks_person_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_groups_blocks" ADD CONSTRAINT "about_groups_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_groups" ADD CONSTRAINT "about_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "press_items" ADD CONSTRAINT "press_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "press_items" ADD CONSTRAINT "press_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."press"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "editions_blocks_banner_order_idx" ON "editions_blocks_banner" USING btree ("_order");
  CREATE INDEX "editions_blocks_banner_parent_id_idx" ON "editions_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "editions_blocks_banner_path_idx" ON "editions_blocks_banner" USING btree ("_path");
  CREATE INDEX "editions_blocks_banner_media_idx" ON "editions_blocks_banner" USING btree ("media_id");
  CREATE INDEX "editions_blocks_rich_text_order_idx" ON "editions_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "editions_blocks_rich_text_parent_id_idx" ON "editions_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "editions_blocks_rich_text_path_idx" ON "editions_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "editions_blocks_media_columns_columns_order_idx" ON "editions_blocks_media_columns_columns" USING btree ("_order");
  CREATE INDEX "editions_blocks_media_columns_columns_parent_id_idx" ON "editions_blocks_media_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "editions_blocks_media_columns_columns_media_idx" ON "editions_blocks_media_columns_columns" USING btree ("media_id");
  CREATE INDEX "editions_blocks_media_columns_order_idx" ON "editions_blocks_media_columns" USING btree ("_order");
  CREATE INDEX "editions_blocks_media_columns_parent_id_idx" ON "editions_blocks_media_columns" USING btree ("_parent_id");
  CREATE INDEX "editions_blocks_media_columns_path_idx" ON "editions_blocks_media_columns" USING btree ("_path");
  CREATE INDEX "editions_blocks_quote_order_idx" ON "editions_blocks_quote" USING btree ("_order");
  CREATE INDEX "editions_blocks_quote_parent_id_idx" ON "editions_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "editions_blocks_quote_path_idx" ON "editions_blocks_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "editions_year_idx" ON "editions" USING btree ("year");
  CREATE INDEX "editions_updated_at_idx" ON "editions" USING btree ("updated_at");
  CREATE INDEX "editions_created_at_idx" ON "editions" USING btree ("created_at");
  CREATE INDEX "prize_recipients_secondary_images_order_idx" ON "prize_recipients_secondary_images" USING btree ("_order");
  CREATE INDEX "prize_recipients_secondary_images_parent_id_idx" ON "prize_recipients_secondary_images" USING btree ("_parent_id");
  CREATE INDEX "prize_recipients_secondary_images_image_idx" ON "prize_recipients_secondary_images" USING btree ("image_id");
  CREATE INDEX "prize_recipients_gallery_order_idx" ON "prize_recipients_gallery" USING btree ("_order");
  CREATE INDEX "prize_recipients_gallery_parent_id_idx" ON "prize_recipients_gallery" USING btree ("_parent_id");
  CREATE INDEX "prize_recipients_gallery_image_idx" ON "prize_recipients_gallery" USING btree ("image_id");
  CREATE INDEX "prize_recipients_edition_idx" ON "prize_recipients" USING btree ("edition_id");
  CREATE INDEX "prize_recipients_slug_idx" ON "prize_recipients" USING btree ("slug");
  CREATE INDEX "prize_recipients_main_main_image_idx" ON "prize_recipients" USING btree ("main_image_id");
  CREATE INDEX "prize_recipients_updated_at_idx" ON "prize_recipients" USING btree ("updated_at");
  CREATE INDEX "prize_recipients_created_at_idx" ON "prize_recipients" USING btree ("created_at");
  CREATE UNIQUE INDEX "edition_slug_idx" ON "prize_recipients" USING btree ("edition_id","slug");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_editions_id_idx" ON "payload_locked_documents_rels" USING btree ("editions_id");
  CREATE INDEX "payload_locked_documents_rels_prize_recipients_id_idx" ON "payload_locked_documents_rels" USING btree ("prize_recipients_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_blocks_banner_order_idx" ON "home_blocks_banner" USING btree ("_order");
  CREATE INDEX "home_blocks_banner_parent_id_idx" ON "home_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_banner_path_idx" ON "home_blocks_banner" USING btree ("_path");
  CREATE INDEX "home_blocks_banner_media_idx" ON "home_blocks_banner" USING btree ("media_id");
  CREATE INDEX "home_blocks_rich_text_order_idx" ON "home_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "home_blocks_rich_text_parent_id_idx" ON "home_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_rich_text_path_idx" ON "home_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "home_blocks_media_columns_columns_order_idx" ON "home_blocks_media_columns_columns" USING btree ("_order");
  CREATE INDEX "home_blocks_media_columns_columns_parent_id_idx" ON "home_blocks_media_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_media_columns_columns_media_idx" ON "home_blocks_media_columns_columns" USING btree ("media_id");
  CREATE INDEX "home_blocks_media_columns_order_idx" ON "home_blocks_media_columns" USING btree ("_order");
  CREATE INDEX "home_blocks_media_columns_parent_id_idx" ON "home_blocks_media_columns" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_media_columns_path_idx" ON "home_blocks_media_columns" USING btree ("_path");
  CREATE INDEX "home_blocks_quote_order_idx" ON "home_blocks_quote" USING btree ("_order");
  CREATE INDEX "home_blocks_quote_parent_id_idx" ON "home_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_quote_path_idx" ON "home_blocks_quote" USING btree ("_path");
  CREATE INDEX "about_blocks_text_order_idx" ON "about_blocks_text" USING btree ("_order");
  CREATE INDEX "about_blocks_text_parent_id_idx" ON "about_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "about_blocks_text_path_idx" ON "about_blocks_text" USING btree ("_path");
  CREATE INDEX "about_blocks_person_order_idx" ON "about_blocks_person" USING btree ("_order");
  CREATE INDEX "about_blocks_person_parent_id_idx" ON "about_blocks_person" USING btree ("_parent_id");
  CREATE INDEX "about_blocks_person_path_idx" ON "about_blocks_person" USING btree ("_path");
  CREATE INDEX "about_blocks_person_image_idx" ON "about_blocks_person" USING btree ("image_id");
  CREATE INDEX "about_groups_blocks_order_idx" ON "about_groups_blocks" USING btree ("_order");
  CREATE INDEX "about_groups_blocks_parent_id_idx" ON "about_groups_blocks" USING btree ("_parent_id");
  CREATE INDEX "about_groups_order_idx" ON "about_groups" USING btree ("_order");
  CREATE INDEX "about_groups_parent_id_idx" ON "about_groups" USING btree ("_parent_id");
  CREATE INDEX "press_items_order_idx" ON "press_items" USING btree ("_order");
  CREATE INDEX "press_items_parent_id_idx" ON "press_items" USING btree ("_parent_id");
  CREATE INDEX "press_items_image_idx" ON "press_items" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "editions_blocks_banner" CASCADE;
  DROP TABLE "editions_blocks_rich_text" CASCADE;
  DROP TABLE "editions_blocks_media_columns_columns" CASCADE;
  DROP TABLE "editions_blocks_media_columns" CASCADE;
  DROP TABLE "editions_blocks_quote" CASCADE;
  DROP TABLE "editions" CASCADE;
  DROP TABLE "prize_recipients_secondary_images" CASCADE;
  DROP TABLE "prize_recipients_gallery" CASCADE;
  DROP TABLE "prize_recipients" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_blocks_banner" CASCADE;
  DROP TABLE "home_blocks_rich_text" CASCADE;
  DROP TABLE "home_blocks_media_columns_columns" CASCADE;
  DROP TABLE "home_blocks_media_columns" CASCADE;
  DROP TABLE "home_blocks_quote" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "about_blocks_text" CASCADE;
  DROP TABLE "about_blocks_person" CASCADE;
  DROP TABLE "about_groups_blocks" CASCADE;
  DROP TABLE "about_groups" CASCADE;
  DROP TABLE "about" CASCADE;
  DROP TABLE "press_items" CASCADE;
  DROP TABLE "press" CASCADE;
  DROP TABLE "emerging_artists_prize" CASCADE;
  DROP TABLE "summit" CASCADE;
  DROP TYPE "public"."enum_editions_blocks_rich_text_width";
  DROP TYPE "public"."enum_editions_blocks_media_columns_aspect_ratio";
  DROP TYPE "public"."enum_home_blocks_rich_text_width";
  DROP TYPE "public"."enum_home_blocks_media_columns_aspect_ratio";
  DROP TYPE "public"."enum_about_blocks_person_layout";`)
}
