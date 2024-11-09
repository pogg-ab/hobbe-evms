// src/application/handlers/organizational-account/remove-organizational-account.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationalAccountService } from 'src/application/services/organizational-account.service';
import { RemoveOrganizationalAccountCommand } from '../../commands/organizational-account/remove-organizational-account.command';

@CommandHandler(RemoveOrganizationalAccountCommand)
export class RemoveOrganizationalAccountCommandHandler
  implements ICommandHandler<RemoveOrganizationalAccountCommand>
{
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  async execute(command: RemoveOrganizationalAccountCommand): Promise<void> {
    const { id } = command;
    return this.organizationalAccountService.deleteOrganizationalAccount(id);
  }
}
