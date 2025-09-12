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
import { FreshdeskModule } from './modules/freshdesk/freshdesk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AutomapperModule.forRoot([
      {
        name: 'default',
        strategyInitializer: classes(),
      },
    ]),
    DatabaseModule,
    CqrsModule,
    // ChatModule,
    // MessageModule,
    EmailModule,
    SmsModule,
    PushNotificationModule,
    StreamModule,
    HobbeChatModule,
    FreshdeskModule
  ],
})
export class AppModule { }
