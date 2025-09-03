import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';

@Injectable()
export class PaymentGatewayFeePermissionSeedService implements OnModuleInit {
  private readonly logger = new Logger(
    PaymentGatewayFeePermissionSeedService.name,
  );

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
  ) {}

  async onModuleInit() {
    await this.seedPaymentGatewayFeePermissions();
  }

  async seedPaymentGatewayFeePermissions() {
    this.logger.log('Running Payment Gateway Fee Permission seeder...');
    await this.seedPaymentGatewayFeePermissionsToExistingRoles();
  }

  private async seedPaymentGatewayFeePermissionsToExistingRoles() {
    const paymentGatewayFeePermissionsToCreate = [
      { action: 'create', resource: 'PaymentGatewayFee' },
      { action: 'view', resource: 'PaymentGatewayFee' },
      { action: 'update', resource: 'PaymentGatewayFee' },
      { action: 'delete', resource: 'PaymentGatewayFee' },
      { action: 'manage', resource: 'PaymentGatewayFee' },
    ];

    const createdPermissions: Permission[] = [];
    for (const permData of paymentGatewayFeePermissionsToCreate) {
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
    this.logger.log(
      `Processed ${createdPermissions.length} payment gateway fee permissions.`,
    );

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

    const userPermissionActions = ['view:PaymentGatewayFee'];

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
      `Assigned ${userAssignedCount} basic payment gateway fee permissions to User role.`,
    );
    this.logger.log(
      'Payment Gateway Fee permission seeding completed successfully!',
    );
  }
}
