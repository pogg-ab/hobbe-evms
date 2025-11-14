import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Events } from 'src/domain/entities/events.entity';
import { GuestController } from 'src/presentation/controllers/guest/guest.controller';
import { GuestsService } from 'src/application/services/guests/guests.service';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { FilterGuestListQueryHandler } from 'src/application/handlers/guest/filter-guest-list-query.handler';
import { GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/guests/guest.repository.token';
import { GuestRepositoryImpl } from 'src/infrastructure/persistence/repositories/guest.repository.impl';
import { UserInfoService } from 'src/application/services/user-info/user-info.service';
import { ClientsModule } from '@nestjs/microservices';
import { kafkaUserInfoConfig } from 'src/infrastructure/kafka/kafka.user-info.config';
import { BlockGuestCommandHandler } from 'src/application/handlers/guest/block-guest-command.handler';
import { BlockedGuestRepositoryImpl } from 'src/infrastructure/persistence/repositories/blocked-guest.repository.impl';
import { BLOCKED_GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/guests/blocked-guest.repository.token';
import { BlockedGuest } from 'src/domain/entities/blocked-guest.entity';
import { GetBlockedGuestsQueryHandler } from 'src/application/handlers/guest/get-blocked-guests-query.handler';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      ParticipantHasTicket,
      TicketBooking,
      Events,
      Tickets,
      BlockedGuest,
    ]),
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_USER_SERVICE',
        useFactory: async () => ({
          transport: kafkaUserInfoConfig.transport,
          options: kafkaUserInfoConfig.options,
        }),
      },
    ]),
  ],
  controllers: [GuestController],
  providers: [
    CreateTicketsDto,
    GuestsService,
    UserInfoService,
    FilterGuestListQueryHandler,
    BlockGuestCommandHandler,
    GetBlockedGuestsQueryHandler,
    {
      provide: GUEST_REPOSITORY_TOKEN,
      useClass: GuestRepositoryImpl,
    },
    {
      provide: BLOCKED_GUEST_REPOSITORY_TOKEN,
      useClass: BlockedGuestRepositoryImpl,
    },
  ],
  exports: [],
})
export class GuestsModule {}
