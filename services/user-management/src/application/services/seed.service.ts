// src/application/services/seed.service.ts

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
// --- NEW ENTITY IMPORT ---
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
    // --- NEW REPOSITORY INJECTION ---
    @InjectRepository(SystemSetting) private readonly systemSettingRepo: Repository<SystemSetting>,
    @Inject('COMMUNICATION_SERVICE') private readonly communicationClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const superAdminRoleExists = await this.roleRepo.findOne({ where: { name: 'Super Admin' } });
    if (superAdminRoleExists) {
      this.logger.log('Core system already seeded. Skipping.');
    } else {
      await this.seedSuperAdminAndSystem();
    }

    const eventManagerExists = await this.roleRepo.findOne({ where: { name: 'Event Manager' } });
    if (eventManagerExists) {
      this.logger.log('Business roles already seeded. Skipping.');
    } else {
      await this.seedBusinessRoles();
    }
  }

  private async seedSuperAdminAndSystem() {
    this.logger.log('Running Super Admin and System seeder...');

    // --- UPDATED PERMISSIONS LIST ---
    const systemPermissions = await this.permissionRepo.save([
      { action: 'create:role', resource: 'RBAC' }, { action: 'view:roles', resource: 'RBAC' },
      { action: 'update:role', resource: 'RBAC' }, { action: 'delete:role', resource: 'RBAC' },
      { action: 'create:permission', resource: 'RBAC' }, { action: 'view:permissions', resource: 'RBAC' },
      { action: 'delete:permission', resource: 'RBAC' },
      { action: 'assign:role', resource: 'AdminUsers' }, { action: 'create:admin_user', resource: 'AdminUsers' },
      { action: 'view:admin_users', resource: 'AdminUsers' }, { action: 'update:admin_user', resource: 'AdminUsers' },
      { action: 'delete:admin_user', resource: 'AdminUsers' }, { action: 'view:audit_log', resource: 'System' },
      // New permission for managing system-wide settings
      { action: 'update:system_settings', resource: 'System' },
    ]);
    this.logger.log('Created foundational system permissions.');

    const superAdminRole = await this.roleRepo.save({ name: 'Super Admin', description: 'Has full control over the entire system.' });
    this.logger.log(`Created 'Super Admin' role.`);

    const systemLinks = systemPermissions.map(p => this.rolePermissionRepo.create({ role: superAdminRole, permission: p }));
    await this.rolePermissionRepo.save(systemLinks);
    this.logger.log('Assigned all system permissions to Super Admin role.');

    await this.roleRepo.save({ name: 'User', description: 'Default role for all registered users.' });
    this.logger.log(`Created default 'User' role for new user registration.`);
    
    // --- NEW BLOCK TO SEED SYSTEM SETTINGS ---
    this.logger.log('Seeding initial system settings...');
    const mfaSettingExists = await this.systemSettingRepo.findOne({ where: { key: 'MFA_REQUIRED' } });
    if (!mfaSettingExists) {
        await this.systemSettingRepo.save({
            key: 'MFA_REQUIRED',
            value: 'false', // Default to OFF for safety
        });
        this.logger.log('Set default system setting for MFA_REQUIRED to false.');
    } else {
        this.logger.log('MFA_REQUIRED setting already exists. Skipping.');
    }
    // --- END OF NEW BLOCK ---

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

    try {
      await this.communicationClient.connect();
      this.logger.log('Kafka client connected successfully for seeding.');

      const emailBody = `
        Hello Super Admin,
        Your account has been seeded successfully.
        Username: ${superAdminAccount.email_address}
        Password: ${fixedPassword}
      `;
      
      const payload = {
          recipient: superAdminAccount.email_address,
          subject: 'Your Super Admin Account Credentials',
          body: emailBody,
      };
      
      this.communicationClient.emit('send-email', payload);
      this.logger.log(`Emitted event to 'send-email' topic.`);

      this.logger.log('Waiting for 2 seconds to ensure message delivery...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.logger.log('Closing Kafka connection.');
      await this.communicationClient.close();

    } catch (error) {
        this.logger.error('Failed to send Kafka message during seeding.', error.stack);
    }
  }

  private async seedBusinessRoles() {
    this.logger.log('Seeding business-level roles and permissions...');

    const businessPermissions = await this.permissionRepo.save([
      { action: 'update', resource: 'Event' }, { action: 'change:status', resource: 'Event' },
      { action: 'delete', resource: 'Event' }, { action: 'process', resource: 'Refund' },
      { action: 'view', resource: 'Report' }, { action: 'update', resource: 'OrganizerProfile' },
      { action: 'manage', resource: 'User' },
    ]);
    this.logger.log('Created business-level permissions.');

    const createdRoles = await this.roleRepo.save([
      { name: 'Event Manager', description: 'Can update events, change status, view reports, and manage organizers.' },
      { name: 'Finance Officer', description: 'Can process refunds and view payment reports.' },
      { name: 'Viewer/Analyst', description: 'Has read-only access to reports and event details.' },
    ]);
    this.logger.log('Created business-level roles.');

    const findPermission = (action: string, resource: string) => businessPermissions.find(p => p.action === action && p.resource === resource);
    const findRole = (name: string) => createdRoles.find(r => r.name === name);

    const linksToCreate = [
      { role: findRole('Event Manager'), permission: findPermission('update', 'Event') },
      { role: findRole('Event Manager'), permission: findPermission('change:status', 'Event') },
      { role: findRole('Event Manager'), permission: findPermission('view', 'Report') },
      { role: findRole('Event Manager'), permission: findPermission('update', 'OrganizerProfile') },
      { role: findRole('Finance Officer'), permission: findPermission('process', 'Refund') },
      { role: findRole('Finance Officer'), permission: findPermission('view', 'Report') },
      { role: findRole('Viewer/Analyst'), permission: findPermission('view', 'Report') },
    ];

    const rolePermissionLinks = this.rolePermissionRepo.create(linksToCreate.filter(link => link.role && link.permission));
    await this.rolePermissionRepo.save(rolePermissionLinks);
    this.logger.log('Successfully assigned permissions to business roles.');

    const superAdminRole = await this.roleRepo.findOne({ where: { name: 'Super Admin' } });
    if (superAdminRole) {
      const superAdminLinks = businessPermissions.map(p => this.rolePermissionRepo.create({ role: superAdminRole, permission: p }));
      await this.rolePermissionRepo.save(superAdminLinks);
      this.logger.log('Successfully assigned all new business permissions to the Super Admin role.');
    }

    this.logger.log('Full database seeding is complete!');
  }
}