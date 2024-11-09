// src/application/admin/commands/create-role.command.ts
import { ICommand } from '@nestjs/cqrs';
import { CreateRoleDto } from 'src/presentation/dtos/create-role.dto';
export class CreateRoleCommand implements ICommand {
  constructor(public readonly createRoleDto: CreateRoleDto) {}
}
