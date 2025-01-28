import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SendSmsCommand } from 'src/application/commands/sms/send-sms.command';

@Controller('sms')
export class SmsController {
  private readonly logger = new Logger(SmsController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('send-sms')
  async handleKafkaPayload(@Payload() payload: any) {
    this.logger.log('Received Kafka message to send SMS.');

    try {
      const messageObject = JSON.parse(payload.value);

      const { recipient, message, messageType } = messageObject;

      await this.commandBus.execute(
        new SendSmsCommand({
          recipient,
          message,
          messageType,
        }),
      );
      this.logger.log('SMS sent successfully.');

      return { message: 'SMS sent from Kafka payload successfully.' };
    } catch (error) {
      this.logger.error('Failed to send SMS from Kafka payload', error.stack);
      return { message: 'Failed to send SMS from Kafka payload.' };
    }
  }
}
