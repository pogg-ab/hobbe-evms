import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRolePermissionsTable1729685323226
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'role_permission_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_id',
            type: 'uuid',
          },
          {
            name: 'permission_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['role_id'],
            referencedTableName: 'roles',
            referencedColumnNames: ['role_id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['permission_id'],
            referencedTableName: 'permissions',
            referencedColumnNames: ['permission_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_permissions');
  }
}
