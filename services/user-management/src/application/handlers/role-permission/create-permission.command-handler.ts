// src/admin/handlers/create-permission.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePermissionCommand } from 'src/application/commands/role-permission/create-permission.command';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';

@CommandHandler(CreatePermissionCommand)
export class CreatePermissionCommandHandler
  implements ICommandHandler<CreatePermissionCommand>
{
  constructor(private readonly adminService: AdminService) {}

  async execute(command: CreatePermissionCommand): Promise<Permission> {
    const { createPermissionDto } = command;
    return this.adminService.addPermission(createPermissionDto);
  }
}
