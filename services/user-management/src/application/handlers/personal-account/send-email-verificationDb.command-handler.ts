import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailVerificationDbCommand } from 'src/application/commands/personal-account/send-email-verification.Dbcommand';
import { PersonalAccountService } from 'src/application/services/personal-account.service';

@CommandHandler(SendEmailVerificationDbCommand)
export class SendEmailVerificationWithDBCommandHandler
  implements ICommandHandler<SendEmailVerificationDbCommand>
{
  constructor(
    @Inject(PersonalAccountService)
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(command: SendEmailVerificationDbCommand): Promise<void> {
    const { sendEmailVerificationDto } = command;
    await this.personalAccountService.sendEmailVerificationDb(
      sendEmailVerificationDto,
    );
  }
}
