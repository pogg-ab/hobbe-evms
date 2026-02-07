import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewedByOnVerificationRequest1757325435902 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    // ensure admin table exists; if not, run this migration after admin table creation
    await queryRunner.query(`
      ALTER TABLE "verification_request"
      ADD CONSTRAINT "FK_verification_reviewed_by_admin"
      FOREIGN KEY ("reviewed_by")
      REFERENCES "admin_user_account" ("admin_user_account_id")
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "verification_request" DROP CONSTRAINT IF EXISTS "FK_verification_reviewed_by_admin";
    `);
  }

}
