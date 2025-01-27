import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendEmailCommand } from 'src/application/commands/email/send-email.command';
import { EmailService } from 'src/application/services/email/email.service';

@Injectable()
@CommandHandler(SendEmailCommand)
export class SendEmailHandler implements ICommandHandler<SendEmailCommand> {
  constructor(private readonly emailService: EmailService) {}

  async execute(command: SendEmailCommand): Promise<void> {
    const { createEmailDto } = command;

    await this.emailService.sendEmail(createEmailDto);
  }
}
