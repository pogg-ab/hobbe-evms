import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from './events/events.module';
import { DatabaseModule } from './infrastructure/persistence/database.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CqrsModule,
    EventsModule,
  ],
})
export class AppModule {}
