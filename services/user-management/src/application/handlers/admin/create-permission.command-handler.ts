// src/admin/handlers/create-permission.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdminService } from 'src/application/services/admin.service';
import { Permission } from 'src/domain/entities/permission.entity';
import { CreatePermissionCommand } from '../../commands/admin/create-permission.command';

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
