import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_blocks_quote" ADD COLUMN IF NOT EXISTS "writer_title" varchar;
  ALTER TABLE "editions_blocks_quote" ADD COLUMN IF NOT EXISTS "writer_title" varchar;

  DO $quote$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'home_blocks_quote'
        AND column_name = 'quote' AND data_type = 'character varying'
    ) THEN
      ALTER TABLE "home_blocks_quote" ALTER COLUMN "quote" DROP NOT NULL;
      ALTER TABLE "home_blocks_quote" ALTER COLUMN "quote" TYPE jsonb USING (
        jsonb_build_object(
          'root', jsonb_build_object(
            'type', 'root',
            'format', '',
            'indent', 0,
            'version', 1,
            'direction', 'ltr',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'format', '',
                'indent', 0,
                'version', 1,
                'direction', 'ltr',
                'textStyle', '',
                'textFormat', 0,
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'mode', 'normal',
                    'text', "quote",
                    'type', 'text',
                    'style', '',
                    'detail', 0,
                    'format', 0,
                    'version', 1
                  )
                )
              )
            )
          )
        )
      );
      ALTER TABLE "home_blocks_quote" ALTER COLUMN "quote" SET NOT NULL;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'editions_blocks_quote'
        AND column_name = 'quote' AND data_type = 'character varying'
    ) THEN
      ALTER TABLE "editions_blocks_quote" ALTER COLUMN "quote" DROP NOT NULL;
      ALTER TABLE "editions_blocks_quote" ALTER COLUMN "quote" TYPE jsonb USING (
        jsonb_build_object(
          'root', jsonb_build_object(
            'type', 'root',
            'format', '',
            'indent', 0,
            'version', 1,
            'direction', 'ltr',
            'children', jsonb_build_array(
              jsonb_build_object(
                'type', 'paragraph',
                'format', '',
                'indent', 0,
                'version', 1,
                'direction', 'ltr',
                'textStyle', '',
                'textFormat', 0,
                'children', jsonb_build_array(
                  jsonb_build_object(
                    'mode', 'normal',
                    'text', "quote",
                    'type', 'text',
                    'style', '',
                    'detail', 0,
                    'format', 0,
                    'version', 1
                  )
                )
              )
            )
          )
        )
      );
      ALTER TABLE "editions_blocks_quote" ALTER COLUMN "quote" SET NOT NULL;
    END IF;
  END
  $quote$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "home_blocks_quote" DROP COLUMN IF EXISTS "writer_title";
  ALTER TABLE "editions_blocks_quote" DROP COLUMN IF EXISTS "writer_title";
  `)
}
