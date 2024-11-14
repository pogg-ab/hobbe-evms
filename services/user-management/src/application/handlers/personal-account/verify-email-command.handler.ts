import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from 'src/application/commands/personal-account/verify-email.command';
import { PersonalAccountService } from 'src/application/services/personal-account.service';
import { VerifyEmailResponse } from 'src/presentation/dtos/verify-email-response.interface';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailCommandHandler
  implements ICommandHandler<VerifyEmailCommand>
{
  constructor(
    private readonly personalAccountService: PersonalAccountService,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResponse> {
    const { verifyEmailDto } = command;
    return this.personalAccountService.verifyEmail(verifyEmailDto);
  }
}
