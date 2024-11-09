// src/application/handlers/organizational-account/update-organizational-account.command-handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationalAccountService } from 'src/application/services/organizational-account.service';
import { UpdateOrganizationalAccountCommand } from '../../commands/organizational-account/update-organizational-account.command';

@CommandHandler(UpdateOrganizationalAccountCommand)
export class UpdateOrganizationalAccountCommandHandler
  implements ICommandHandler<UpdateOrganizationalAccountCommand>
{
  constructor(
    private readonly organizationalAccountService: OrganizationalAccountService,
  ) {}

  async execute(command: UpdateOrganizationalAccountCommand): Promise<string> {
    const { id, updateOrganizationalAccountDto } = command;
    return this.organizationalAccountService.update(
      id,
      updateOrganizationalAccountDto,
    );
  }
}
