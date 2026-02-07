import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from 'src/application/services/notification/notification.service';
import { Notification } from 'src/domain/entities/notification.entity';
import { NotificationPreference } from 'src/domain/entities/notification-preference.entity';
import { NotificationConsumerController } from 'src/presentation/consumers/notification.consumer.controller';
import { NotificationController } from 'src/presentation/controller/notification/notification.controller';
import { PushNotificationModule } from '../push-notification/push-notification.module';
import { KafkaProducerModule } from 'src/infrastructure/kafka/kafka-producer.module';
import { NotificationsGateway } from 'src/presentation/gateways/notifications.gateway';
import { EmailModule } from '../email/email.module';
import { SmsModule } from '../sms/sms.module';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. Import ClientsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference]),
    PushNotificationModule, 
    KafkaProducerModule,
    EmailModule,
    SmsModule,
    // --- 2. IMPORT AND CONFIGURE THE CLIENTS MODULE ---
    ClientsModule.register([
      {
        name: 'USER_MANAGEMENT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'comm-user-producer-local', // Use a specific ID for this module's client
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'comm-user-consumer-group-local', // Use a specific group ID
          },
        },
      },
    ]),
  ],
  controllers: [NotificationConsumerController, NotificationController],
  providers: [
    NotificationService,
    NotificationsGateway,
  ],
  exports: [
    NotificationService, 
    NotificationsGateway,
  ],
})
export class NotificationModule {}