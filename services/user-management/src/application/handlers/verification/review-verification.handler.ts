import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReviewVerificationCommand } from '../../commands/verificiation/review-verification.command';
import { VerificationService } from '../../services/verification.service';

@CommandHandler(ReviewVerificationCommand)
export class ReviewVerificationHandler implements ICommandHandler<ReviewVerificationCommand> {
  constructor(private readonly service: VerificationService) {}

  async execute(command: ReviewVerificationCommand) {
    return this.service.reviewVerificationRequest(
      command.adminId,
      command.verificationRequestId,
      command.decision,
    );
  }
}
