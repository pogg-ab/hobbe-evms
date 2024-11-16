import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailVerificationCommand } from 'src/application/commands/personal-account/send-email-verification.command';
import { PersonalAccountService } from 'src/application/services/personal-account.service';

@CommandHandler(SendEmailVerificationCommand)
export class SendEmailVerificationCommandHandler
  implements ICommandHandler<SendEmailVerificationCommand>
{
  constructor(
    @Inject(PersonalAccountService)
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(command: SendEmailVerificationCommand): Promise<void> {
    const { sendEmailVerificationDto } = command;
    await this.personalAccountService.sendEmailVerification(
      sendEmailVerificationDto,
    );
  }
}
