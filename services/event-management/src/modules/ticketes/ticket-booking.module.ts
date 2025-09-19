import { AutomapperModule } from '@automapper/nestjs';
import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateTicketBookingCommandHandler } from 'src/application/handlers/tickets/create-ticket-booking.command-handler';
import { DeleteTicketBookingCommandHandler } from 'src/application/handlers/tickets/delete-ticket-booking.command-handler';
import { FindTicketBookingByEventQueryHandler } from 'src/application/handlers/tickets/find-ticket-booking-by-event.query-handler';
import { FindTicketBookingsByTicketBuyerQueryHandler } from 'src/application/handlers/tickets/find-ticket-booking-by-ticket-buyer.handler';
import { FindTicketBookingsByEventOrganizerQueryHandler } from 'src/application/handlers/tickets/find-ticket-bookings-by-event-organizer.handler';
import { GetAllTicketBookingsQueryHandler } from 'src/application/handlers/tickets/get-all-ticket-bookings.query-handler';
import { FindTicketBookingByIdQueryHandler } from 'src/application/handlers/tickets/get-ticket-booking-by-id.query-handler';
import { UpdateTicketBookingCommandHandler } from 'src/application/handlers/tickets/update-ticket-booking.command-handler';
import { UpdateTicketStatusHandler } from 'src/application/handlers/tickets/update-ticket-status.handler';
import { TicketBookingProfile } from 'src/application/mappers/ticket-booking.profile';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { BookingHasPromocode } from 'src/domain/entities/booking-has-promocode.entity';
import { Events } from 'src/domain/entities/events.entity';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';
import { Partnership } from 'src/domain/entities/partnership.entity';
import { Promocodes } from 'src/domain/entities/promocodes.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { TicketGifts } from 'src/domain/entities/ticket-gifts.entity';
import { TicketsHeading } from 'src/domain/entities/tickets-heading.entity';
import { Tickets } from 'src/domain/entities/tickets.entity';
import { CREATE_EVENT_REPOSITORY_TOKEN } from 'src/domain/repositories/events/event.repository.token';
import { CREATE_BOOKING_HAS_PAYMENT_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/booking-has-payment.repository.token';
import { CREATE_BOOKING_HAS_PROMOCODE_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/booking-has-promocode.repository.token';
import { CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/participant-has-ticket.repository';
import { CREATE_PARTNERSHIP_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/partnership.repository.token';
import { CREATE_PROMOCODE_TOKEN } from 'src/domain/repositories/tickets/promocode.repository.token';
import { CREATE_TICKET_BOOKING_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticket-booking.repository.token';
import { CREATE_TICKET_GIFTS_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticket-gifts.repository.token';
import { CREATE_TICKET_HEADING_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets-heading.repository.token';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
import { KafkaPaymentRpcService } from 'src/infrastructure/kafka/kafka-payment-rpc.service';
import { kafkaCheckinPrivilegeConfig } from 'src/infrastructure/kafka/kafka.checkin-privilege.config';
import { KafkaConsumerService } from 'src/infrastructure/kafka/kafka.consumer.service';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { KafkaRefundRpcConsumerService } from 'src/infrastructure/kafka/kafka.rfund.rpc.consumer..service';
import { kafkaUserInfoConfig } from 'src/infrastructure/kafka/kafka.user-info.config';
import { BookingHasPaymentRepositoryImpl } from 'src/infrastructure/persistence/repositories/booking-has-payment.repository.impl';
import { BookingHasPromocodeRepositoryImpl } from 'src/infrastructure/persistence/repositories/booking-has-promocode.repository.impl';
import { EventRepositoryEmpl } from 'src/infrastructure/persistence/repositories/event.repository.impl';
import { ParticipantHasTicketRepositoryImpl } from 'src/infrastructure/persistence/repositories/participant-has-ticket.repository.impl';
import { PartnershipRepositoryImpl } from 'src/infrastructure/persistence/repositories/partnership.repository.impl';
import { PromocodeRepositoryImpl } from 'src/infrastructure/persistence/repositories/promocode.repository.impl';
import { TicketBookingRepositoryImpl } from 'src/infrastructure/persistence/repositories/ticket-booking.repository.impl';
import { TicketGiftsRepositoryImpl } from 'src/infrastructure/persistence/repositories/ticket-gifts.repository.impl';
import { TicketsHeadingRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets-heading.repository.impl';
import { TicketsRepositoryEmpl } from 'src/infrastructure/persistence/repositories/tickets.repository.impl';
import { SocketIo } from 'src/infrastructure/socket-io/socket.gateway';
import { TicketBookingController } from 'src/presentation/controllers/ticket-booking/ticket-booking.controller';
import { CreateTicketsDto } from 'src/presentation/dtos/tickets/create-tickets.dto';
import { EventsModule } from '../event/events.module';
import { TicketsModule } from './tickets.module';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      TicketBooking,
      BookingHasPayment,
      BookingHasPromocode,
      Tickets,
      Events,
      TicketsHeading,
      TicketGifts,
      ParticipantHasTicket,
      Partnership,
      Promocodes,
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CHECKIN_PRIVILEGE_SERVICE',
        useFactory: async () => ({
          transport: kafkaCheckinPrivilegeConfig.transport,
          options: kafkaCheckinPrivilegeConfig.options,
        }),
      },
    ]),
    CqrsModule,
    EventsModule,
    TicketsModule,
  ],

  controllers: [TicketBookingController],
  providers: [
    CreateTicketsDto,
    CreateTicketBookingCommandHandler,
    GetAllTicketBookingsQueryHandler,
    UpdateTicketStatusHandler,
    FindTicketBookingByEventQueryHandler,
    FindTicketBookingByIdQueryHandler,
    FindTicketBookingsByTicketBuyerQueryHandler,
    FindTicketBookingsByEventOrganizerQueryHandler,
    UpdateTicketBookingCommandHandler,
    DeleteTicketBookingCommandHandler,
    TicketBookingProfile,
    TicketBookingService,
    SocketIo,
    KafkaProducerService,
    KafkaConsumerService,
    KafkaPaymentRpcService,
    KafkaRefundRpcConsumerService,
    {
      provide: CREATE_TICKET_BOOKING_REPOSITORY_TOKEN,
      useClass: TicketBookingRepositoryImpl,
    },
    {
      provide: CREATE_TICKET_REPOSITORY_TOKEN,
      useClass: TicketsRepositoryEmpl,
    },
    {
      provide: CREATE_EVENT_REPOSITORY_TOKEN,
      useClass: EventRepositoryEmpl,
    },
    {
      provide: CREATE_TICKET_HEADING_REPOSITORY_TOKEN,
      useClass: TicketsHeadingRepositoryEmpl,
    },
    {
      provide: CREATE_PARTICIPANT_HAS_TICKET_REPOSITORY_TOKEN,
      useClass: ParticipantHasTicketRepositoryImpl,
    },
    {
      provide: CREATE_TICKET_GIFTS_REPOSITORY_TOKEN,
      useClass: TicketGiftsRepositoryImpl,
    },
    {
      provide: CREATE_PARTNERSHIP_REPOSITORY_TOKEN,
      useClass: PartnershipRepositoryImpl,
    },
    {
      provide: CREATE_PROMOCODE_TOKEN,
      useClass: PromocodeRepositoryImpl,
    },
    {
      provide: CREATE_BOOKING_HAS_PROMOCODE_REPOSITORY_TOKEN,
      useClass: BookingHasPromocodeRepositoryImpl,
    },
    {
      provide: CREATE_BOOKING_HAS_PAYMENT_REPOSITORY_TOKEN,
      useClass: BookingHasPaymentRepositoryImpl,
    },
  ],
  exports: [
    CREATE_TICKET_BOOKING_REPOSITORY_TOKEN
  ]
})
export class TicketBookingModule { }
