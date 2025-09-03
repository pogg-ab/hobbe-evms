import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignRoleToUserCommand } from '../../commands/admin-user-account/assign-role-to-user.command';
import { AdminUserAccountService } from '../../services/admin-user-account.service';

@CommandHandler(AssignRoleToUserCommand)
export class AssignRoleToUserCommandHandler
  implements ICommandHandler<AssignRoleToUserCommand>
{
  constructor(private readonly service: AdminUserAccountService) {}

  async execute(command: AssignRoleToUserCommand): Promise<any> {
    // This is the only part that changes.
    // We now get the full 'assignRoleDto' from the command.
    const { userId, assignRoleDto } = command;
    
    // And we pass the full DTO to the service.
    return this.service.assignRoleToUser(userId, assignRoleDto);
  }
}