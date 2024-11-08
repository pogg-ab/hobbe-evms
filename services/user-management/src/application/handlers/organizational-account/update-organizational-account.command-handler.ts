// src/application/handlers/organizational-account/update-organizational-account.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationalAccountService } from 'src/application/services/organizational-account.service';
import { OrganizationalAccount } from 'src/domain/entities/organizational-account.entity';
import { UpdateOrganizationalAccountCommand } from '../../commands/organizational-account/update-organizational-account.command';

@CommandHandler(UpdateOrganizationalAccountCommand)
export class UpdateOrganizationalAccountCommandHandler
  implements ICommandHandler<UpdateOrganizationalAccountCommand>
{
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  async execute(
    command: UpdateOrganizationalAccountCommand,
  ): Promise<OrganizationalAccount> {
    const { id, updateOrganizationalAccountDto } = command;
    return this.organizationalAccountService.update(
      id,
      updateOrganizationalAccountDto,
    );
  }
}
