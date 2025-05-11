import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendEmailCommand } from 'src/application/commands/email/send-email.command';
import { CreateEmailDto } from 'src/presentation/dto/email/create-email.dto';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly commandBus: CommandBus) { }

  @MessagePattern('send-email')
  async handleKafkaPayload(@Payload() payload: CreateEmailDto) {
    this.logger.log('Received Kafka message to send email.');
    try {
      await this.commandBus.execute(new SendEmailCommand(payload));
      this.logger.log('Email sent successfully.');

      return { message: 'Email sent from Kafka payload successfully.' };
    } catch (error) {
      this.logger.error('Failed to send email from Kafka payload', error.stack);
      return { message: 'Failed to send email from Kafka payload.' };
    }
  }
}
