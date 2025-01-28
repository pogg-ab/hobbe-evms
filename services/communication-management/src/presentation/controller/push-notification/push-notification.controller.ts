import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePushNotificationCommand } from 'src/application/commands/push-notification/create-push-notification.command';
import { CreatePushNotificationDto } from 'src/presentation/dto/push-notification/create-push-notification.dto';

@Controller('push-notification')
export class PushNotificationController {
  private readonly logger = new Logger(PushNotificationController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern('create-push-notification')
  async handleKafkaPayload(@Payload() payload: CreatePushNotificationDto) {
    this.logger.log('Received Kafka message to create push notification.');
    try {
      // Execute the command to create the push notification
      await this.commandBus.execute(new CreatePushNotificationCommand(payload));
      this.logger.log('Push notification created successfully.');

      return {
        message: 'Push notification created from Kafka payload successfully.',
      };
    } catch (error) {
      this.logger.error(
        'Failed to create push notification from Kafka payload',
        error.stack,
      );
      return {
        message: 'Failed to create push notification from Kafka payload.',
      };
    }
  }
}
