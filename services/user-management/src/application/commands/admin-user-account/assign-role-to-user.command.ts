// src/application/commands/admin-user-account/assign-role-to-user.command.ts

import { ICommand } from '@nestjs/cqrs';
import { AssignRoleDto } from 'src/presentation/dtos/assign-role.dto';

export class AssignRoleToUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly assignRoleDto: AssignRoleDto,
  ) {}
}
