// src/application/handlers/sub-account/create-sub-account.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubAccountService } from 'src/application/services/sub-account.service';
import { CreateSubAccountCommand } from '../../commands/sub-account/create-sub-account.command';

@CommandHandler(CreateSubAccountCommand)
export class CreateSubAccountCommandHandler
  implements ICommandHandler<CreateSubAccountCommand> {
  constructor(private readonly subAccountService: SubAccountService) { }

  async execute(command: CreateSubAccountCommand): Promise<any> {
    const { createSubAccountDto, userId } = command;
    return this.subAccountService.create(createSubAccountDto, userId);
  }
}
