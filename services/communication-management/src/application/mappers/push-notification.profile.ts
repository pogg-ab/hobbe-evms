import { createMap, forMember, mapFrom, Mapper } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PushNotification } from 'src/domain/entities/push-notification.entity';
import { CreatePushNotificationDto } from 'src/presentation/dto/push-notification/create-push-notification.dto';

@Injectable()
export class PushNotificationProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      createMap(
        mapper,
        CreatePushNotificationDto,
        PushNotification,
        forMember(
          (destination) => destination.recipient,
          mapFrom((src) => src.recipient),
        ),
        forMember(
          (destination) => destination.title,
          mapFrom((src) => src.title),
        ),
        forMember(
          (destination) => destination.message,
          mapFrom((src) => src.message),
        ),
        forMember(
          (destination) => destination.message_type,
          mapFrom((src) => src.message_type || 'INFO'),
        ),
        forMember(
          (destination) => destination.platform,
          mapFrom((src) => src.platform || 'IOS'),
        ),
        forMember(
          (destination) => destination.status,
          mapFrom((src) => src.status || 'PENDING'),
        ),
        forMember(
          (destination) => destination.priority,
          mapFrom((src) => src.priority || 1),
        ),
        forMember(
          (destination) => destination.created_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.sent_at,
          mapFrom(() => null),
        ),
        forMember(
          (destination) => destination.delivered_at,
          mapFrom(() => null),
        ),
        forMember(
          (destination) => destination.updated_at,
          mapFrom(() => new Date()),
        ),
        forMember(
          (destination) => destination.updated_by,
          mapFrom(() => null),
        ),
      );
    };
  }
}
