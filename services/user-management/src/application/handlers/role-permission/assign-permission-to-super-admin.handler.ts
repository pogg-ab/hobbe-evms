// src/application/handlers/role-permission/assign-permission-to-super-admin.handler.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Role } from 'src/domain/entities/role.entity';
import { RolePermission } from 'src/domain/entities/role-permission.entity';
import { PermissionCreatedEvent } from '../../domain-events/permission-created.event';

@EventsHandler(PermissionCreatedEvent)
export class AssignPermissionToSuperAdminHandler
  implements IEventHandler<PermissionCreatedEvent>
{
  private readonly logger = new Logger(
    AssignPermissionToSuperAdminHandler.name,
  );

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async handle(event: PermissionCreatedEvent) {
    const { permission } = event;
    this.logger.log(
      `Handling event to assign permission '${permission.action}:${permission.resource}' to Super Admin.`,
    );

    try {
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'Super Admin' },
      });

      if (!superAdminRole) {
        this.logger.warn(
          `'Super Admin' role not found. Skipping auto-assignment.`,
        );
        return;
      }

      const newLink = this.rolePermissionRepository.create({
        role: superAdminRole,
        permission: permission,
      });

      await this.rolePermissionRepository.save(newLink);

      this.logger.log(
        `Successfully assigned new permission to 'Super Admin' role by creating link.`,
      );
    } catch (error) {
      if (error.code === '23505') {
        this.logger.log(
          `Link between Super Admin and this permission already exists. No action needed.`,
        );
      } else {
        this.logger.error(
          `Failed to assign new permission to Super Admin. Error: ${error.message}`,
          error.stack,
        );
      }
    }
  }
}
