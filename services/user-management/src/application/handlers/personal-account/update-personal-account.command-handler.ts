import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { UpdatePersonalAccountCommand } from '../../commands/personal-account/update-personal-account.command';

@CommandHandler(UpdatePersonalAccountCommand)
export class UpdatePersonalAccountCommandHandler
  implements ICommandHandler<UpdatePersonalAccountCommand>
{
  constructor(
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(
    command: UpdatePersonalAccountCommand,
  ): Promise<PersonalAccount> {
    const { id, updatePersonalAccountDto } = command;
    return this.personalAccountService.update(id, updatePersonalAccountDto);
  }
}
