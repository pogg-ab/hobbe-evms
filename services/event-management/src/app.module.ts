import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { LikeModule } from './modules/categories copy/like.module';
import { EventSponsorModule } from './modules/event-sponsor/event-sponsor.module';
import { EventsModule } from './modules/event/events.module';
import { SpecialGuestModule } from './modules/special-guest/special-guest.module';
import { TicketBookingModule } from './modules/ticketes/ticket-booking.module';
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
    SpecialGuestModule,
    EventSponsorModule,
  ],
})
export class AppModule {}
