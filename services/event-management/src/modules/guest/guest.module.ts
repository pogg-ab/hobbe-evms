import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { Events } from 'src/domain/entities/events.entity';
import { GuestController } from 'src/presentation/controllers/guest/guest.controller';
import { GuestsService } from 'src/application/services/guests/guests.service';
// import { GuestsProfile } from 'src/application/mappers/guests.profile';
import { CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/participant-has-ticket.repository';
import { ParticipantHasTicketRepositoryImpl } from 'src/infrastructure/persistence/repositories/participant-has-ticket.repository.impl';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { FilterGuestListQueryHandler } from 'src/application/handlers/guest/filter-guest-list-query.handler';
import { GUEST_REPOSITORY_TOKEN } from 'src/domain/repositories/guests/guest.repository.token';
import { GuestRepositoryImpl } from 'src/infrastructure/persistence/repositories/guest.repository.impl';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      ParticipantHasTicket,
      TicketBooking,
      Events,
      Tickets,
    ]),
    CqrsModule,
  ],
  controllers: [GuestController],
  providers: [
    CreateTicketsDto,
    GuestsService,
    // GuestsProfile,
    FilterGuestListQueryHandler,
    {
      provide: GUEST_REPOSITORY_TOKEN,
      useClass: GuestRepositoryImpl,
    },
  ],
  exports: [],
})
export class GuestsModule {}
