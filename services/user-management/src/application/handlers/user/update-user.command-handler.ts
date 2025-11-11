import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserService } from 'src/application/services/user.service';
import { UpdateUserCommand } from '../../commands/user/update-user.command';
import { User } from 'src/domain/entities/user.entity';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler
  implements ICommandHandler<UpdateUserCommand>
{
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateUserCommand): Promise<User> {
    const { userId, updateUserDto } = command;
    return this.userService.update(userId, updateUserDto);
  }
}
