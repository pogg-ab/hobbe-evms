import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SuspendUserCommand } from 'src/application/commands/user/suspend-user.command';
import { UserService } from 'src/application/services/user.service';

@CommandHandler(SuspendUserCommand)
export class SuspendUserCommandHandler
  implements ICommandHandler<SuspendUserCommand>
{
  constructor(private readonly userService: UserService) {}

  async execute(command: SuspendUserCommand): Promise<any> {
    const userId = command.userId;

    return this.userService.suspendUser(userId);
  }
}
