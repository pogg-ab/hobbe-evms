import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeKeyConstraint1757429288409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // 1) Drop old constraint if it exists (defensive)
    await queryRunner.query(`
      ALTER TABLE "verification_request"
      DROP CONSTRAINT IF EXISTS "FK_verification_reviewed_by_admin";
    `);

    // 2) Also drop any index that might block creating new FK (some ORMs create REL_ indexes)
    //    We defensively attempt to drop an index named REL_* that references personal_account_id — harmless if not present.
    //    Note: This block is optional; keep or remove depending on your environment.
    await queryRunner.query(`
      DO $$
      BEGIN
        -- If an index named REL_verification_reviewed_by exists drop it (no-op if not present)
        -- Replace 'REL_verification_reviewed_by' with the exact name if you know it.
        -- This block is safe and will not error if no such index exists.
        BEGIN
          EXECUTE 'DROP INDEX IF EXISTS "REL_verification_reviewed_by"';
        EXCEPTION WHEN others THEN
          -- ignore
        END;
      END;
      $$;
    `);

    // 3) Add new foreign key referencing admin_user(admin_user_id)
    //    Adjust referenced table/column names here if your admin table uses a different name.
    await queryRunner.query(`
      ALTER TABLE "verification_request"
      ADD CONSTRAINT "FK_verification_reviewed_by_admin_user"
      FOREIGN KEY ("reviewed_by")
      REFERENCES "admin_user" ("admin_user_id")
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // reverse: drop new fk, recreate old fk to admin_user_account
    await queryRunner.query(`
      ALTER TABLE "verification_request"
      DROP CONSTRAINT IF EXISTS "FK_verification_reviewed_by_admin_user";
    `);

    await queryRunner.query(`
      ALTER TABLE "verification_request"
      ADD CONSTRAINT "FK_verification_reviewed_by_admin"
      FOREIGN KEY ("reviewed_by")
      REFERENCES "admin_user_account" ("admin_user_account_id")
      ON DELETE SET NULL;
    `);
  }

}
