import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { EventsModule } from './modules/event/events.module';
import { TicketBookingModule } from './modules/ticketes/ticket-booking.module';
import { LikeModule } from './modules/categories copy/like.module';
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
    EventsModule,
    TicketBookingModule,
    LikeModule,
  ],
})
export class AppModule {}
