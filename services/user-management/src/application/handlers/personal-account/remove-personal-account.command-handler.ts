import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { RemovePersonalAccountCommand } from '../../commands/personal-account/remove-personal-account.command';

@CommandHandler(RemovePersonalAccountCommand)
export class RemovePersonalAccountCommandHandler
  implements ICommandHandler<RemovePersonalAccountCommand>
{
  constructor(
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(command: RemovePersonalAccountCommand): Promise<void> {
    const { id } = command;
    return this.personalAccountService.deletePersonalAccount(id);
  }
}
