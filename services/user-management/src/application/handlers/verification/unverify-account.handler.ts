import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnverifyAccountCommand } from '../../commands/verificiation/unverify-account.command';
import { VerificationService } from '../../services/verification.service';

@CommandHandler(UnverifyAccountCommand)
export class UnverifyAccountHandler implements ICommandHandler<UnverifyAccountCommand> {
  constructor(private readonly service: VerificationService) {}

  async execute(command: UnverifyAccountCommand) {
    return this.service.unverifyAccount(command.adminId, command.personalAccountId);
  }
}
