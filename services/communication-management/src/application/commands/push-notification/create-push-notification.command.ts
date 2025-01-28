import { ICommand } from '@nestjs/cqrs';
import { CreatePushNotificationDto } from 'src/presentation/dto/push-notification/create-push-notification.dto';

export class CreatePushNotificationCommand implements ICommand {
  constructor(
    public readonly createPushNotificationDto: CreatePushNotificationDto,
  ) {}
}
