import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';

@Injectable()
export class TaxPermissionSeedService implements OnModuleInit {
  private readonly logger = new Logger(TaxPermissionSeedService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async onModuleInit() {
    await this.seedTaxPermissions();
  }

  async seedTaxPermissions() {
    this.logger.log('Running Tax Permission seeder...');
    await this.seedTaxPermissionsToExistingRoles();
  }

  private async seedTaxPermissionsToExistingRoles() {
    const taxPermissionsToCreate = [
      { action: 'create', resource: 'Tax' },
      { action: 'view', resource: 'Tax' },
      { action: 'update', resource: 'Tax' },
      { action: 'delete', resource: 'Tax' },
      { action: 'manage', resource: 'Tax' },
    ];

    const createdPermissions: Permission[] = [];
    for (const permData of taxPermissionsToCreate) {
      const existingPermission = await this.permissionRepo.findOne({
        where: { action: permData.action, resource: permData.resource },
      });
      if (!existingPermission) {
        const permission = await this.permissionRepo.save(permData);
        createdPermissions.push(permission);
        this.logger.log(
          `Created permission: ${permData.action}:${permData.resource}`,
        );
      } else {
        this.logger.log(
          `Permission already exists: ${permData.action}:${permData.resource}`,
        );
        createdPermissions.push(existingPermission);
      }
    }
    this.logger.log(`Processed ${createdPermissions.length} tax permissions.`);

    const superAdminRole = await this.roleRepo.findOne({
      where: { name: 'Super Admin' },
    });
    const userRole = await this.roleRepo.findOne({ where: { name: 'User' } });

    if (!superAdminRole || !userRole) {
      this.logger.error(
        'Required roles (Super Admin, User) not found. Please run the main seed service first.',
      );
      return;
    }

    let superAdminAssignedCount = 0;
    for (const permission of createdPermissions) {
      const existingAssignment = await this.rolePermissionRepo.findOne({
        where: {
          role: { role_id: superAdminRole.role_id },
          permission: { permission_id: permission.permission_id },
        },
      });
      if (!existingAssignment) {
        await this.rolePermissionRepo.save(
          this.rolePermissionRepo.create({ role: superAdminRole, permission }),
        );
        superAdminAssignedCount++;
      }
    }
    this.logger.log(
      `Assigned ${superAdminAssignedCount} permissions to Super Admin role.`,
    );

    const userPermissionActions = ['view:Tax'];

    let userAssignedCount = 0;
    for (const permission of createdPermissions) {
      if (
        userPermissionActions.includes(
          `${permission.action}:${permission.resource}`,
        )
      ) {
        const existingAssignment = await this.rolePermissionRepo.findOne({
          where: {
            role: { role_id: userRole.role_id },
            permission: { permission_id: permission.permission_id },
          },
        });
        if (!existingAssignment) {
          await this.rolePermissionRepo.save(
            this.rolePermissionRepo.create({ role: userRole, permission }),
          );
          userAssignedCount++;
        }
      }
    }
    this.logger.log(
      `Assigned ${userAssignedCount} basic tax permissions to User role.`,
    );
    this.logger.log('Tax permission seeding completed successfully!');
  }
}
