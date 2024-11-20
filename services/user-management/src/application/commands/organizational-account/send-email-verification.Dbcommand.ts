import { ICommand } from '@nestjs/cqrs';
import { SendEmailVerificationDto } from 'src/presentation/dtos/send-email-verification.dto';

export class SendEmailVerificationDbCommand implements ICommand {
  constructor(
    public readonly sendEmailVerificationDto: SendEmailVerificationDto,
  ) {}
}
