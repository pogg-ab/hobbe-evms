import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from '../../commands/admin-user-account/assign-role-to-user.command';
import { AdminUserAccountService } from '../../services/admin-user-account.service';

@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserCommandHandler
  implements ICommandHandler<AssignRoleToUserCommand>
{
  constructor(private readonly service: AdminUserAccountService) {}

  async execute(command: AssignRoleToUserCommand): Promise<any> {
    const { userId, assignRoleDto } = command;
    return this.service.assignRoleToUser(userId, assignRoleDto);
  }
}
