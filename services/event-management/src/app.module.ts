import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { LikeModule } from './modules/likes/like.module';
import { EventSponsorModule } from './modules/event-sponsor/event-sponsor.module';
import { EventsModule } from './modules/event/events.module';
import { SpecialGuestModule } from './modules/special-guest/special-guest.module';
import { TicketBookingModule } from './modules/ticketes/ticket-booking.module';
import { CommentsModule } from './modules/comments/comments.module';
import { SocketIoModule } from './modules/socket-io/socket-io.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { EventShareModule } from './modules/event-share/event-share.module';

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
    LikeModule,
    FavoriteModule,
    SpecialGuestModule,
    EventSponsorModule,
    CommentsModule,
    TicketBookingModule,
    SocketIoModule,
    EventShareModule
  ],
})
export class AppModule {}
