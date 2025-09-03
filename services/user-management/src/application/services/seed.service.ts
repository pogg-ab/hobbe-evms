import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ClientKafka } from '@nestjs/microservices';

// Entity Imports
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
    @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(AdminUser) private readonly adminUserRepo: Repository<AdminUser>,
    @InjectRepository(AdminUserAccount) private readonly adminAccountRepo: Repository<AdminUserAccount>,
    @InjectRepository(AdminUserRole) private readonly adminUserRoleRepo: Repository<AdminUserRole>,
    @InjectRepository(RolePermission) private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(SystemSetting) private readonly systemSettingRepo: Repository<SystemSetting>,
    @Inject('COMMUNICATION_SERVICE') private readonly communicationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const superAdminRoleExists = await this.roleRepo.findOne({ where: { name: 'Super Admin' } });
    if (!superAdminRoleExists) {
      await this.seedSuperAdminAndSystem();
    } else {
      this.logger.log('Core system already seeded. Skipping.');
    }

    const eventManagerExists = await this.roleRepo.findOne({ where: { name: 'Event Manager' } });
    if (!eventManagerExists) {
      await this.seedBusinessRoles();
    } else {
      this.logger.log('Business roles already seeded. Skipping.');
    }
  }

  // --- HELPER 1: Safely find or create a Permission ---
  private async findOrCreatePermission(action: string, resource: string): Promise<Permission> {
    let permission = await this.permissionRepo.findOne({ where: { action, resource } });
    if (!permission) {
      this.logger.log(`Creating permission: ${action} on ${resource}`);
      permission = this.permissionRepo.create({ action, resource });
      await this.permissionRepo.save(permission);
    }
    return permission;
  }

  // --- HELPER 2: Safely link a Role to a Permission ---
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

  private async seedSuperAdminAndSystem() {
    this.logger.log('Running Super Admin and System seeder...');

    const systemPermissionsData = [
      { action: 'create:role', resource: 'RBAC' }, { action: 'view:roles', resource: 'RBAC' },
      { action: 'update:role', resource: 'RBAC' }, { action: 'delete:role', resource: 'RBAC' },
      { action: 'create:permission', resource: 'RBAC' }, { action: 'view:permissions', resource: 'RBAC' },
      { action: 'delete:permission', resource: 'RBAC' },
      { action: 'assign:role', resource: 'AdminUsers' }, { action: 'create:admin_user', resource: 'AdminUsers' },
      { action: 'view:admin_users', resource: 'AdminUsers' }, { action: 'update:admin_user', resource: 'AdminUsers' },
      { action: 'delete:admin_user', resource: 'AdminUsers' }, { action: 'view:audit_log', resource: 'System' },
      { action: 'update:system_settings', resource: 'System' },
    ];
    const systemPermissions = await Promise.all(
      systemPermissionsData.map(p => this.findOrCreatePermission(p.action, p.resource)),
    );
    this.logger.log('Verified foundational system permissions.');

    const superAdminRole = await this.roleRepo.save({ name: 'Super Admin', description: 'Has full control over the entire system.' });
    this.logger.log(`Created 'Super Admin' role.`);

    for (const permission of systemPermissions) {
      await this.linkPermissionToRole(superAdminRole, permission);
    }
    this.logger.log('Assigned all system permissions to Super Admin role.');

    await this.roleRepo.save({ name: 'User', description: 'Default role for all registered users.' });
    this.logger.log(`Created default 'User' role for new user registration.`);
    
    this.logger.log('Seeding initial system settings...');
    const mfaSettingExists = await this.systemSettingRepo.findOne({ where: { key: 'MFA_REQUIRED' } });
    if (!mfaSettingExists) {
      await this.systemSettingRepo.save({ key: 'MFA_REQUIRED', value: 'false' });
      this.logger.log('Set default system setting for MFA_REQUIRED to false.');
    } else {
      this.logger.log('MFA_REQUIRED setting already exists. Skipping.');
    }

    const superAdminAccount = await this.adminAccountRepo.save({
        first_name: 'Super',
        last_name: 'Admin',
        email_address: 'superadmin@gmail.com',
        phone_number: '+10000000000',
    });
    this.logger.log('Created Super Admin account profile with specified credentials.');
    
    const fixedPassword = 'password!';
    const hashedPassword = await bcrypt.hash(fixedPassword, 10);

    const superAdminUser = await this.adminUserRepo.save({
        user_name: 'superadmin@gmail.com',
        password: hashedPassword,
        admin_user_account: superAdminAccount.admin_user_account_id as any,
    });
    this.logger.log('Created Super Admin login.');

    await this.adminUserRoleRepo.save({
        admin_user_id: superAdminUser.admin_user_id as any,
        role: superAdminRole,
    });
    this.logger.log('Assigned "Super Admin" role to the first user.');
  }

  private async seedBusinessRoles() {
    this.logger.log('Seeding business-level roles and permissions...');

    const businessPermissionsData = [
      { action: 'update', resource: 'Event' }, { action: 'change:status', resource: 'Event' },
      { action: 'delete', resource: 'Event' }, { action: 'process', resource: 'Refund' },
      { action: 'view', resource: 'Report' }, { action: 'update', resource: 'OrganizerProfile' },
      { action: 'manage', resource: 'User' },
    ];
    const businessPermissions = await Promise.all(
      businessPermissionsData.map(p => this.findOrCreatePermission(p.action, p.resource)),
    );
    this.logger.log('Verified business-level permissions.');

    const createdRoles = await this.roleRepo.save([
      { name: 'Event Manager', description: 'Can update events, change status, view reports, and manage organizers.' },
      { name: 'Finance Officer', description: 'Can process refunds and view payment reports.' },
      { name: 'Viewer/Analyst', description: 'Has read-only access to reports and event details.' },
    ]);
    this.logger.log('Created business-level roles.');

    const eventManagerRole = createdRoles.find(r => r.name === 'Event Manager');
    const financeOfficerRole = createdRoles.find(r => r.name === 'Finance Officer');
    const viewerRole = createdRoles.find(r => r.name === 'Viewer/Analyst');

    // Link permissions to roles using the safe helper function
    await this.linkPermissionToRole(eventManagerRole, businessPermissions.find(p => p.action === 'update' && p.resource === 'Event'));
    await this.linkPermissionToRole(eventManagerRole, businessPermissions.find(p => p.action === 'change:status' && p.resource === 'Event'));
    await this.linkPermissionToRole(eventManagerRole, businessPermissions.find(p => p.action === 'view' && p.resource === 'Report'));
    await this.linkPermissionToRole(eventManagerRole, businessPermissions.find(p => p.action === 'update' && p.resource === 'OrganizerProfile'));
    
    await this.linkPermissionToRole(financeOfficerRole, businessPermissions.find(p => p.action === 'process' && p.resource === 'Refund'));
    await this.linkPermissionToRole(financeOfficerRole, businessPermissions.find(p => p.action === 'view' && p.resource === 'Report'));
    
    await this.linkPermissionToRole(viewerRole, businessPermissions.find(p => p.action === 'view' && p.resource === 'Report'));

    this.logger.log('Successfully assigned permissions to business roles.');

    const superAdminRole = await this.roleRepo.findOne({ where: { name: 'Super Admin' } });
    if (superAdminRole) {
      for (const permission of businessPermissions) {
        await this.linkPermissionToRole(superAdminRole, permission);
      }
      this.logger.log('Successfully assigned all new business permissions to the Super Admin role.');
    }

    this.logger.log('Full database seeding is complete!');
  }
}