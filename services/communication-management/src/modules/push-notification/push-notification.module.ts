import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientKafka } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePushNotificationHandler } from 'src/application/handlers/push-notification/create-push-notification.command-handler';
import { PushNotificationProfile } from 'src/application/mappers/push-notification.profile';
import { PushNotificationService } from 'src/application/services/push-notification/push-notification.service';
import { PushNotification } from 'src/domain/entities/push-notification.entity';
import { PUSH_NOTIFICATION_REPOSITORY_TOKEN } from 'src/domain/repositories/push-notification/push-notification.repository.token';
import { kafkaConsumerConfig } from 'src/infrastructure/kafka/kafka.consumer.config';
import { PushNotificationRepositoryImpl } from 'src/infrastructure/persistance/repository/push-notification.repository.impl';
import { PushNotificationSenderService } from 'src/infrastructure/push-notification/push-notification-sender.service';
import { PushNotificationController } from 'src/presentation/controller/push-notification/push-notification.controller';

@Module({
  imports: [
    AutomapperModule,
    CqrsModule,
    TypeOrmModule.forFeature([PushNotification]),
  ],
  controllers: [PushNotificationController],
  providers: [
    PushNotificationProfile,
    PushNotificationService,
    PushNotificationSenderService,
    {
      provide: PUSH_NOTIFICATION_REPOSITORY_TOKEN,
      useClass: PushNotificationRepositoryImpl,
    },
    {
      provide: 'KAFKA_CONSUMER',
      useFactory: async () => {
        const client = new ClientKafka(kafkaConsumerConfig.options);
        try {
          await client.connect();
          return client;
        } catch (error) {
          console.error('Error connecting to Kafka:', error);
          throw error;
        }
      },
    },
    CreatePushNotificationHandler,
    PushNotificationRepositoryImpl,
  ],
  exports: [
    PUSH_NOTIFICATION_REPOSITORY_TOKEN,
    PushNotificationRepositoryImpl,
    PushNotificationService,
  ],
})
export class PushNotificationModule {}
