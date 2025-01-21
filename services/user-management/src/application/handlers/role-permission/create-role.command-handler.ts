// src/admin/handlers/create-role.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoleCommand } from 'src/application/commands/role-permission/create-role.command';
import { AdminService } from 'src/application/services/admin.service';
import { Role } from 'src/domain/entities/role.entity';

@CommandHandler(CreateRoleCommand)
export class CreateRoleCommandHandler
  implements ICommandHandler<CreateRoleCommand>
{
  constructor(private readonly adminService: AdminService) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const { createRoleDto } = command;
    return this.adminService.create(createRoleDto);
  }
}
