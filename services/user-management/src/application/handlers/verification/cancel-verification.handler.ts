import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelVerificationCommand } from '../../commands/verificiation/cancel-verification.command';
import { VerificationService } from '../../services/verification.service';

@CommandHandler(CancelVerificationCommand)
export class CancelVerificationHandler implements ICommandHandler<CancelVerificationCommand> {
  constructor(private readonly service: VerificationService) {}

  async execute(command: CancelVerificationCommand) {
    return this.service.cancelVerification(command.currentUserId);
  }
}
