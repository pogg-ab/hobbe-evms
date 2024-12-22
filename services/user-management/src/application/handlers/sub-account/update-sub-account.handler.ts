// src/application/handlers/sub-account/update-sub-account.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubAccountService } from 'src/application/services/sub-account.service';
import { UpdateSubAccountCommand } from '../../commands/sub-account/update-sub-account.command';

@CommandHandler(UpdateSubAccountCommand)
export class UpdateSubAccountCommandHandler
  implements ICommandHandler<UpdateSubAccountCommand>
{
  constructor(private readonly subAccountService: SubAccountService) {}

  async execute(command: UpdateSubAccountCommand): Promise<any> {
    const { id, updateSubAccountDto } = command;
    return this.subAccountService.update(id, updateSubAccountDto);
  }
}
