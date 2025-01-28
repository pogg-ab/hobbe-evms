import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePushNotificationCommand } from 'src/application/commands/push-notification/create-push-notification.command';
import { PushNotificationService } from 'src/application/services/push-notification/push-notification.service';

@Injectable()
@CommandHandler(CreatePushNotificationCommand)
export class CreatePushNotificationHandler
  implements ICommandHandler<CreatePushNotificationCommand>
{
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async execute(command: CreatePushNotificationCommand): Promise<void> {
    const { createPushNotificationDto } = command;

    await this.pushNotificationService.createPushNotification(
      createPushNotificationDto,
    );
  }
}
