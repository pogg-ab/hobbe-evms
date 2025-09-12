import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVerficationRequestTable1757324320020 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "verification_request" (
        "verification_request_id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "personal_account_id" uuid NOT NULL,
        "status" varchar(50) NOT NULL DEFAULT 'PENDING',
        "reason" text NOT NULL,
        "national_id_image" text NOT NULL,
        "rejection_reason" text NULL,
        "submitted_at" timestamptz NOT NULL DEFAULT now(),
        "reviewed_at" timestamptz NULL,
        "reviewed_by" uuid NULL,
        CONSTRAINT "UQ_verification_personal_account" UNIQUE ("personal_account_id"),
        CONSTRAINT "FK_verification_personal_account" FOREIGN KEY ("personal_account_id") REFERENCES "personal_account" ("personal_account_id") ON DELETE CASCADE
      );
    `);

    // Seed existing denormalized data into verification_request (reviewed_by left NULL)
    await queryRunner.query(`
      INSERT INTO "verification_request" (
        "verification_request_id",
        "personal_account_id",
        "status",
        "reason",
        "national_id_image",
        "rejection_reason",
        "submitted_at",
        "reviewed_at",
        "reviewed_by"
      )
      SELECT
        uuid_generate_v4() as verification_request_id,
        pa.personal_account_id,
        COALESCE(NULLIF(pa.verification_status, ''), (CASE WHEN pa.is_verified THEN 'APPROVED' ELSE 'PENDING' END)) as status,
        COALESCE(pa.verification_reason, '') as reason,
        COALESCE(pa.national_id_image, '') as national_id_image,
        pa.verification_rejection_reason as rejection_reason,
        COALESCE(pa.created_date, now()) as submitted_at,
        pa.verification_date as reviewed_at,
        NULL as reviewed_by
      FROM personal_account pa
      WHERE
        COALESCE(pa.verification_status, '') <> ''
        OR COALESCE(pa.verification_reason, '') <> ''
        OR COALESCE(pa.national_id_image, '') <> ''
        OR pa.is_verified = true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "verification_request";`);
  }
}
