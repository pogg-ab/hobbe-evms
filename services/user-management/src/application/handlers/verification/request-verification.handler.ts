import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestVerificationCommand } from '../../commands/verificiation/request-verification.command';
import { VerificationService } from '../../services/verification.service';

@CommandHandler(RequestVerificationCommand)
export class RequestVerificationHandler implements ICommandHandler<RequestVerificationCommand> {
  constructor(private readonly service: VerificationService) {}

  async execute(command: RequestVerificationCommand) {
    return this.service.requestVerification(command.currentUserId, command.dto);
  }
}
