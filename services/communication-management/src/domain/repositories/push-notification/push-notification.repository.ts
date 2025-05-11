import { PushNotification } from 'src/domain/entities/push-notification.entity';
import { PushNotificationID } from 'src/domain/value-objects/push-notification-id.value-object';

export interface IPushNotificationRepository {
  create(pushNotification: PushNotification): Promise<PushNotification>;
  findAll(): Promise<PushNotification[]>;
  findOneById(id: PushNotificationID): Promise<PushNotification | null>;
  update(
    id: PushNotificationID,
    pushNotification: PushNotification,
  ): Promise<PushNotification>;
  delete(id: PushNotificationID): Promise<void>;
  updateStatus(
    id: PushNotificationID,
    status: 'SENT' | 'FAILED' | 'PENDING' | null,
    updatedBy: string,
  ): Promise<void>;
}
