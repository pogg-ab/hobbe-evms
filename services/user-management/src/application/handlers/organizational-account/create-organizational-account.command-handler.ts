// src/application/handlers/organizational-account/create-organizational-account.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationalAccountService } from 'src/application/services/organizational-account.service';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { CreateOrganizationalAccountCommand } from '../../commands/organizational-account/create-organizational-account.command';

@CommandHandler(CreateOrganizationalAccountCommand)
export class CreateOrganizationalAccountCommandHandler
  implements ICommandHandler<CreateOrganizationalAccountCommand>
{
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  async execute(
    command: CreateOrganizationalAccountCommand,
  ): Promise<OrganizationalAccount> {
    const { createOrganizationalAccountDto } = command;
    return this.organizationalAccountService.create(
      createOrganizationalAccountDto,
    );
  }
}
