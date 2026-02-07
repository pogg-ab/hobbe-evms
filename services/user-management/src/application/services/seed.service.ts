import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ClientKafka } from '@nestjs/microservices';

import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { AdminUser } from 'src/domain/entities/admin-user.entity';
import { AdminUserRole } from 'src/domain/entities/admin-user-role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { AdminUserAccount } from 'src/domain/entities/admin-user-account.entity';
import { SystemSetting } from 'src/domain/entities/system-setting.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(AdminUser)
    private readonly adminUserRepo: Repository<AdminUser>,
    @InjectRepository(AdminUserAccount)
    private readonly adminAccountRepo: Repository<AdminUserAccount>,
    @InjectRepository(AdminUserRole)
    private readonly adminUserRoleRepo: Repository<AdminUserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepo: Repository<SystemSetting>,
    @Inject('COMMUNICATION_SERVICE')
    private readonly communicationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.assignPermissionsToRoles();
    await this.seedSystemSettings();
    await this.seedSuperAdminUser();
    this.logger.log('Seeding verification and creation process complete.');
  }

  private async findOrCreatePermission(
    action: string,
    resource: string,
  ): Promise<Permission> {
    let permission = await this.permissionRepo.findOne({
      where: { action, resource },
    });
    if (!permission) {
      this.logger.log(`Creating permission: ${action} on ${resource}`);
      permission = this.permissionRepo.create({ action, resource });
      await this.permissionRepo.save(permission);
    }
    return permission;
  }

  private async linkPermissionToRole(role: Role, permission: Permission) {
    if (!role || !permission) return;
    const linkExists = await this.rolePermissionRepo.findOne({
      where: {
        role: { role_id: role.role_id },
        permission: { permission_id: permission.permission_id },
      },
    });
    if (!linkExists) {
      const newLink = this.rolePermissionRepo.create({ role, permission });
      await this.rolePermissionRepo.save(newLink);
    }
  }

  private async seedPermissions() {
    this.logger.log('Verifying all permissions exist...');
    const permissionsData = [
      // System & RBAC Permissions
      { action: 'create:role', resource: 'RBAC' },
      { action: 'view:roles', resource: 'RBAC' },
      { action: 'update:role', resource: 'RBAC' },
      { action: 'delete:role', resource: 'RBAC' },
      { action: 'create:permission', resource: 'RBAC' },
      { action: 'view:permissions', resource: 'RBAC' },
      { action: 'delete:permission', resource: 'RBAC' },
      { action: 'assign:role', resource: 'AdminUsers' },
      { action: 'create:admin_user', resource: 'AdminUsers' },
      { action: 'view:admin_users', resource: 'AdminUsers' },
      { action: 'update:admin_user', resource: 'AdminUsers' },
      { action: 'delete:admin_user', resource: 'AdminUsers' },
      { action: 'view:audit_log', resource: 'System' },
      { action: 'update:system_settings', resource: 'System' },
      // Admin Alert Permissions
      { action: 'create:admin_alert', resource: 'System' },
      { action: 'view:admin_alerts', resource: 'System' },
      { action: 'update:admin_alert', resource: 'System' },
      { action: 'delete:admin_alert', resource: 'System' },
      // Business Permissions
      { action: 'update', resource: 'Event' },
      { action: 'change:status', resource: 'Event' },
      { action: 'delete', resource: 'Event' },
      { action: 'process', resource: 'Refund' },
      { action: 'view', resource: 'Report' },
      { action: 'update', resource: 'OrganizerProfile' },
      { action: 'manage', resource: 'User' },
    ];
    await Promise.all(
      permissionsData.map((p) =>
        this.findOrCreatePermission(p.action, p.resource),
      ),
    );
  }

  private async seedRoles() {
    this.logger.log('Verifying all core roles exist...');
    await this.roleRepo.upsert(
      [
        {
          name: 'Super Admin',
          description: 'Has full control over the entire system.',
        },
        {
          name: 'Event Manager',
          description:
            'Can update events, change status, view reports, and manage organizers.',
        },
        {
          name: 'Finance Officer',
          description: 'Can process refunds and view payment reports.',
        },
        {
          name: 'Viewer/Analyst',
          description: 'Has read-only access to reports and event details.',
        },
        { name: 'User', description: 'Default role for all registered users.' },
      ],
      ['name'],
    );
  }

  private async assignPermissionsToRoles() {
    this.logger.log('Verifying role-permission assignments...');
    const allPermissions = await this.permissionRepo.find();
    const allRoles = await this.roleRepo.find();

    const findPerm = (action: string, resource: string) =>
      allPermissions.find(
        (p) => p.action === action && p.resource === resource,
      );
    const findRole = (name: string) => allRoles.find((r) => r.name === name);

    const superAdminRole = findRole('Super Admin');
    const eventManagerRole = findRole('Event Manager');
    const financeOfficerRole = findRole('Finance Officer');
    const viewerRole = findRole('Viewer/Analyst');

    if (superAdminRole) {
      for (const permission of allPermissions) {
        await this.linkPermissionToRole(superAdminRole, permission);
      }
    }

    await this.linkPermissionToRole(
      eventManagerRole,
      findPerm('update', 'Event'),
    );
    await this.linkPermissionToRole(
      eventManagerRole,
      findPerm('change:status', 'Event'),
    );
    await this.linkPermissionToRole(
      eventManagerRole,
      findPerm('view', 'Report'),
    );
    await this.linkPermissionToRole(
      eventManagerRole,
      findPerm('update', 'OrganizerProfile'),
    );

    await this.linkPermissionToRole(
      financeOfficerRole,
      findPerm('process', 'Refund'),
    );
    await this.linkPermissionToRole(
      financeOfficerRole,
      findPerm('view', 'Report'),
    );

    await this.linkPermissionToRole(viewerRole, findPerm('view', 'Report'));
  }

  private async seedSystemSettings() {
    this.logger.log('Verifying initial system settings...');
    const mfaSetting = await this.systemSettingRepo.findOne({
      where: { key: 'MFA_REQUIRED' },
    });
    if (!mfaSetting) {
      await this.systemSettingRepo.save({
        key: 'MFA_REQUIRED',
        value: 'false',
      });
      this.logger.log('Set default system setting for MFA_REQUIRED to false.');
    }
  }

  private async seedSuperAdminUser() {
    this.logger.log('Verifying Super Admin user exists...');
    const adminExists = await this.adminUserRepo.findOne({
      where: { user_name: 'superadmin@gmail.com' },
    });
    if (adminExists) return;

    const superAdminRole = await this.roleRepo.findOne({
      where: { name: 'Super Admin' },
    });
    if (!superAdminRole) {
      this.logger.error(
        'Cannot seed Super Admin user because Super Admin role does not exist!',
      );
      return;
    }

    const superAdminAccount = await this.adminAccountRepo.save({
      first_name: 'Super',
      last_name: 'Admin',
      email_address: 'superadmin@gmail.com',
      phone_number: '+10000000000',
    });

    const hashedPassword = await bcrypt.hash('password!', 10);

    const superAdminUser = await this.adminUserRepo.save({
      user_name: 'superadmin@gmail.com',
      password: hashedPassword,
      admin_user_account: superAdminAccount.admin_user_account_id as any,
    });

    await this.adminUserRoleRepo.save({
      admin_user_id: superAdminUser.admin_user_id as any,
      role: superAdminRole,
    });
    this.logger.log('Successfully created Super Admin user and assigned role.');
  }
}
