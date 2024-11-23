// src/application/admin/commands/create-permission.command.ts
import { ICommand } from '@nestjs/cqrs';
import { CreatePermissionDto } from 'src/presentation/dtos/create-permission.dto';
export class CreatePermissionCommand implements ICommand {
  constructor(public readonly createPermissionDto: CreatePermissionDto) {}
}
