import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { PersonalAccount } from 'src/domain/entities/personal-account.entity';
import { CreatePersonalAccountCommand } from '../commands/create-personal-account.command';

@CommandHandler(CreatePersonalAccountCommand)
export class CreatePersonalAccountCommandHandler
  implements ICommandHandler<CreatePersonalAccountCommand>
{
  constructor(
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(
    command: CreatePersonalAccountCommand,
  ): Promise<PersonalAccount> {
    const { createPersonalAccountDto } = command;
    return this.personalAccountService.create(createPersonalAccountDto);
  }
}
