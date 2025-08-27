import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';

import { Permission } from 'src/domain/entities/permission.entity';
import { Role } from 'src/domain/entities/role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';

@Injectable()
export class EventPermissionSeedService implements OnModuleInit {
    private readonly logger = new Logger(EventPermissionSeedService.name);

    constructor(
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission) private readonly rolePermissionRepo: Repository<RolePermission>,
    ) { }

    async onModuleInit() {
        await this.seedEventPermissions();
    }

    async seedEventPermissions() {

        this.logger.log('Running Event Permission seeder...');
        await this.seedEventPermissionsToExistingRoles();
    }

    private async seedEventPermissionsToExistingRoles() {
        const eventPermissionsToCreate = [
            { action: 'create:event', resource: 'Event' },
            { action: 'view:event', resource: 'Event' },
            { action: 'update:event', resource: 'Event' },
            { action: 'delete:event', resource: 'Event' },

            { action: 'publish:event', resource: 'Event' },
            { action: 'unpublish:event', resource: 'Event' },
            { action: 'change-status:event', resource: 'Event' },

            { action: 'view-details:event', resource: 'Event' },
            { action: 'view-statistics:event', resource: 'Event' },
            { action: 'view-reports:event', resource: 'Event' },

            { action: 'manage-tickets:event', resource: 'Event' },
            { action: 'manage-attendees:event', resource: 'Event' },
            { action: 'manage-categories:event', resource: 'Event' },
            { action: 'manage-locations:event', resource: 'Event' },

            { action: 'search:event', resource: 'Event' },
            { action: 'add-favorite:event', resource: 'Event' },
            { action: 'remove-favorite:event', resource: 'Event' },
            { action: 'view-favorites:event', resource: 'Event' },


            { action: 'approve:event', resource: 'Event' },
            { action: 'reject:event', resource: 'Event' },
        ];

        const createdPermissions: Permission[] = [];

        for (const permData of eventPermissionsToCreate) {
            const existingPermission = await this.permissionRepo.findOne({
                where: { action: permData.action, resource: permData.resource }
            });

            if (!existingPermission) {
                const permission = await this.permissionRepo.save(permData);
                createdPermissions.push(permission);
                this.logger.log(`Created permission: ${permData.action}`);
            } else {
                this.logger.log(`Permission already exists: ${permData.action}`);
                createdPermissions.push(existingPermission);
            }
        }

        this.logger.log(`Processed ${createdPermissions.length} event permissions.`);

        const superAdminRole = await this.roleRepo.findOne({ where: { name: 'Super Admin' } });
        const userRole = await this.roleRepo.findOne({ where: { name: 'User' } });

        if (!superAdminRole || !userRole) {
            this.logger.error('Required roles (Super Admin, User) not found. Please run the main seed service first.');
            return;
        }

        let superAdminAssignedCount = 0;
        for (const permission of createdPermissions) {
            const existingAssignment = await this.rolePermissionRepo.findOne({
                where: {
                    role: { role_id: superAdminRole.role_id },
                    permission: { permission_id: permission.permission_id }
                }
            });

            if (!existingAssignment) {
                await this.rolePermissionRepo.save(
                    this.rolePermissionRepo.create({ role: superAdminRole, permission })
                );
                superAdminAssignedCount++;
            }
        }
        this.logger.log(`Assigned ${superAdminAssignedCount} permissions to Super Admin role.`);

        const userPermissionActions = [
            'create:event',
            'view:event',
            'view-details:event',
            'search:event',
            'add-favorite:event',
            'remove-favorite:event',
            'view-favorites:event'
        ];

        let userAssignedCount = 0;
        for (const permission of createdPermissions) {
            if (userPermissionActions.includes(permission.action)) {
                const existingAssignment = await this.rolePermissionRepo.findOne({
                    where: {
                        role: { role_id: userRole.role_id },
                        permission: { permission_id: permission.permission_id }
                    }
                });

                if (!existingAssignment) {
                    await this.rolePermissionRepo.save(
                        this.rolePermissionRepo.create({ role: userRole, permission })
                    );
                    userAssignedCount++;
                }
            }
        }
        this.logger.log(`Assigned ${userAssignedCount} basic event permissions to User role.`);

        this.logger.log('Event permission seeding completed successfully!');

    }


}