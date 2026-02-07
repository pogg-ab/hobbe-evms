import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReactivateUserCommand } from 'src/application/commands/user/reactivate-user.command';
import { UserService } from '../../services/user.service';

@CommandHandler(ReactivateUserCommand)
export class ReactivateUserCommandHandler
  implements ICommandHandler<ReactivateUserCommand>
{
  constructor(private readonly userService: UserService) {}

  async execute(command: ReactivateUserCommand): Promise<any> {
    const userId = command.userId;

    return this.userService.reactivateUser(userId);
  }
}
