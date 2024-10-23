import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePersonalAccountTable1729301953474
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'personal_account',
        columns: [
          {
            name: 'personal_account_id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'first_name',
            type: 'varchar',
          },
          {
            name: 'surname',
            type: 'varchar',
          },
          {
            name: 'email_address',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
          },
          {
            name: 'country',
            type: 'varchar',
          },
          {
            name: 'profile_image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'date_of_birth',
            type: 'date',
          },
          {
            name: 'national_id',
            type: 'varchar',
          },
          {
            name: 'national_id_image',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'json',
          },
          {
            name: 'is_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verification_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'email_verification_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email_verification_expires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_phone_number_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'phone_verification_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phone_verification_expires',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_date',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_by',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'updated_date',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('personal_account');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('personal_account', fk);
      }
    }
    await queryRunner.dropTable('personal_account');
  }
}
