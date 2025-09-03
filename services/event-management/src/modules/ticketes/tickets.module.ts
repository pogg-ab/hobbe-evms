import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { TicketsController } from 'src/presentation/controllers/tickets/tickets.controller';
import { TicketsService } from 'src/application/services/tickets/tickets.service';
import { TicktesProfile } from 'src/application/mappers/tickets.profile';
import { TICKETS_LIST_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticketslist.repository.token';
import { TicketsRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets.repository.impl';
import { GetAllTicketsHandler } from 'src/application/handlers/tickets/get-all-events-tickets.handler';
import { TicketsFindByIdQueryHandler } from 'src/application/handlers/tickets/findone-tickets.handler';
import { GetAllTicketsQueryHandler } from 'src/application/handlers/tickets/get-all-tickets.handler';
import { CreateTicketsCommandHandler } from 'src/application/handlers/tickets/create-tickets.handler';
import { TicketsFindByHeadingQueryHandler } from 'src/application/handlers/tickets/find-all-tickets-by-heading.handler';
import { CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/participant-has-ticket.repository';
import { ParticipantHasTicketRepositoryImpl } from 'src/infrastructure/persistence/repositories/participant-has-ticket.repository.impl';
import { GetUserTicketsQueryHandler } from 'src/application/handlers/tickets/get-user-tickets.query-handler';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { Events } from 'src/domain/entities/events.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { FindOneQueryHandler } from 'src/application/handlers/tickets/find-one.query.handler';
import { QrCodeScannedLogHandler } from 'src/application/handlers/tickets/qrcode-scanned-log.handler';
import { CountQrCodeScannedLogsQueryHandler } from 'src/application/handlers/qr-code/count-qr-code-scanned-logs-query.handler';
import { QrScannedAggregateQueryHandler } from 'src/application/handlers/qr-code/qr-code-scanned-logs-aggregate-query.handler';
import { QrCodeLogAfterScannedCommandHandler } from 'src/application/handlers/qr-code/qr-code-log-after-scanned-command.handler';
import { QrAfterScannedActionsAggregateQueryHandler } from 'src/application/handlers/qr-code/qr-code-actions-after-scanned-query.handler';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      Tickets,
      ParticipantHasTicket,
      TicketBooking,
      Events,
    ]),
    CqrsModule,
  ],
  controllers: [TicketsController],
  providers: [
    CreateTicketsDto,
    TicketsService,
    TicktesProfile,
    CreateTicketsCommandHandler,
    GetAllTicketsQueryHandler,
    FindOneQueryHandler,
    GetAllTicketsHandler,
    GetUserTicketsQueryHandler,
    TicketsFindByIdQueryHandler,
    TicketsFindByHeadingQueryHandler,
    QrCodeScannedLogHandler,
    CountQrCodeScannedLogsQueryHandler,
    QrScannedAggregateQueryHandler,
    QrCodeLogAfterScannedCommandHandler,
    QrAfterScannedActionsAggregateQueryHandler,
    {
      provide: TICKETS_LIST_REPOSITORY_TOKEN,
      useClass: TicketsRepositoryEmpl,
    },
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    },
    {
      provide: CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN,
      useClass: ParticipantHasTicketRepositoryImpl,
    },
  ],
  exports: [TICKETS_LIST_REPOSITORY_TOKEN],
})
export class TicketsModule {}
