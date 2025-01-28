import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PushNotification } from 'src/domain/entities/push-notification.entity';
import { firebaseMessaging } from '../firebase/firebase.config';

@Injectable()
export class PushNotificationSenderService {
  constructor(@InjectMapper() private readonly mapper: Mapper) {}

  async createPushNotification(
    pushNotification: PushNotification,
  ): Promise<PushNotification> {
    try {
      const validToken = 'your-known-valid-fcm-token';

      const message = {
        notification: {
          title: pushNotification.title,
          body: pushNotification.message,
        },
        token: validToken,
      };

      await firebaseMessaging.send(message);
      pushNotification.status = 'SENT';
    } catch (error) {
      pushNotification.status = 'FAILED';
      console.error('Error sending notification to Firebase:', error);
    }

    return pushNotification;
  }
}
