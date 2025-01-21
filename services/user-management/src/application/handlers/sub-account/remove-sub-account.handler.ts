// src/application/handlers/sub-account/remove-sub-account.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubAccountService } from 'src/application/services/sub-account.service';
import { RemoveSubAccountCommand } from '../../commands/sub-account/remove-sub-account.command';

@CommandHandler(RemoveSubAccountCommand)
export class RemoveSubAccountCommandHandler
  implements ICommandHandler<RemoveSubAccountCommand>
{
  constructor(private readonly subAccountService: SubAccountService) {}

  async execute(command: RemoveSubAccountCommand): Promise<void> {
    const { id } = command;
    return this.subAccountService.deleteSubAccount(id);
  }
}
