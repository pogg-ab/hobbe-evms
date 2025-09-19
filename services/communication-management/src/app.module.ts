import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/persistance/database.module';
import { EmailModule } from './modules/email/email.module';
import { PushNotificationModule } from './modules/push-notification/push-notification.module';
import { SmsModule } from './modules/sms/sms.module';
import { StreamModule } from './modules/live-stream/stream.module';
import { HobbeChatModule } from './modules/hobbe-chat/hobbe-chat.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthModule } from './modules/auth/auth.module';
import { FaqModule } from './modules/faq/faq.module';
import { SupportModule } from './modules/support/support.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'USER_MANAGEMENT_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'comm-user-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
          },
          consumer: {
            groupId: 'comm-user-consumer-group',
          },
        },
      },
    ]),
    AutomapperModule.forRoot([
      {
        name: 'default',
        strategyInitializer: classes(),
      },
    ]),
    DatabaseModule,
    CqrsModule,
    EmailModule,
    SmsModule,
    PushNotificationModule,
    StreamModule,
    HobbeChatModule,
    NotificationModule, 
    AuthModule, 
    FaqModule,
    SupportModule
  ],
  exports: [ClientsModule],
})
export class AppModule { }