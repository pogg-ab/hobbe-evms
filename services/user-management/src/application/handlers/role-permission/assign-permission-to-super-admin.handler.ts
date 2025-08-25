// src/application/handlers/role-permission/assign-permission-to-super-admin.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Role } from 'src/domain/entities/role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity'; // <-- Import the link entity
import { PermissionCreatedEvent } from '../../domain-events/permission-created.event';

@EventsHandler(PermissionCreatedEvent)
export class AssignPermissionToSuperAdminHandler implements IEventHandler<PermissionCreatedEvent> {
  private readonly logger = new Logger(AssignPermissionToSuperAdminHandler.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission) // <-- Inject the repository for the link table
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async handle(event: PermissionCreatedEvent) {
    const { permission } = event;
    this.logger.log(`Handling event to assign permission '${permission.action}:${permission.resource}' to Super Admin.`);

    try {
      const superAdminRole = await this.roleRepository.findOne({ where: { name: 'Super Admin' } });

      if (!superAdminRole) {
        this.logger.warn(`'Super Admin' role not found. Skipping auto-assignment.`);
        return;
      }
      
      // Create a new instance of the link entity
      const newLink = this.rolePermissionRepository.create({
        role: superAdminRole,
        permission: permission,
      });

      // Save the new link to the database
      await this.rolePermissionRepository.save(newLink);

      this.logger.log(`Successfully assigned new permission to 'Super Admin' role by creating link.`);
    } catch (error) {
      // The @Unique constraint will throw an error if the link already exists, which we can ignore.
      if (error.code === '23505') { // PostgreSQL unique violation error code
        this.logger.log(`Link between Super Admin and this permission already exists. No action needed.`);
      } else {
        this.logger.error(`Failed to assign new permission to Super Admin. Error: ${error.message}`, error.stack);
      }
    }
  }
}