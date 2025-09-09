import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveKeyConstraint1757410321327 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Drop the UNIQUE constraint if present (name may vary)
    await queryRunner.query(`
      ALTER TABLE "verification_request"
      DROP CONSTRAINT IF EXISTS "UQ_verification_personal_account";
    `);

    // 2) Drop the auto-generated relation unique index (REL_xxx) if it exists
    // We defensively attempt to drop an index with a prefix REL_; runtime will ignore if not present.
    // IMPORTANT: replace 'REL_6f9d829d467771888834ac93da' with your actual REL name if you know it.
    // But we attempt to drop any UNIQUE constraint/index on personal_account_id by checking pg_class.
    await queryRunner.query(`
      DO $$
      DECLARE
        idx RECORD;
      BEGIN
        FOR idx IN
          SELECT c.relname as indexname
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relkind = 'i' AND c.relname LIKE 'rel_%'
        LOOP
          BEGIN
            EXECUTE format('DROP INDEX IF EXISTS "%s"', idx.indexname);
          EXCEPTION WHEN others THEN
            -- ignore
          END;
        END LOOP;
      END
      $$;
    `);

    // 3) Create a non-unique index on personal_account_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_verification_personal_account_id" ON "verification_request" ("personal_account_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // reverse: drop non-unique index and attempt to create unique constraint (if desired)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_verification_personal_account_id";
    `);

    // Recreate unique constraint if you absolutely want to restore old behavior (not recommended).
    await queryRunner.query(`
      ALTER TABLE "verification_request"
      ADD CONSTRAINT IF NOT EXISTS "UQ_verification_personal_account" UNIQUE ("personal_account_id");
    `);
  }
}
