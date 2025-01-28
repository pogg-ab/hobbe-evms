import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { PushNotification } from 'src/domain/entities/push-notification.entity';
import { IPushNotificationRepository } from 'src/domain/repositories/push-notification/push-notification.repository';
import { PUSH_NOTIFICATION_REPOSITORY_TOKEN } from 'src/domain/repositories/push-notification/push-notification.repository.token';
import { CreatePushNotificationDto } from 'src/presentation/dto/push-notification/create-push-notification.dto';

@Injectable()
export class PushNotificationService {
  constructor(
    @Inject(PUSH_NOTIFICATION_REPOSITORY_TOKEN)
    private readonly pushNotificationRepository: IPushNotificationRepository,

    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createPushNotification(
    createPushNotificationDto: CreatePushNotificationDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const pushNotification = this.mapper.map(
        createPushNotificationDto,
        CreatePushNotificationDto,
        PushNotification,
      );
      await this.pushNotificationRepository.create(pushNotification);
      return {
        success: true,
        message: 'Push Notification created successfully',
      };
    } catch (error) {
      console.error('Failed to create Push Notification:', error);
      return { success: false, message: 'Failed to create Push Notification' };
    }
  }

  async getAllPushNotifications(): Promise<PushNotification[]> {
    return this.pushNotificationRepository.findAll();
  }
}
