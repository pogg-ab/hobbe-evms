import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateTicketBookingCommandHandler } from 'src/application/handlers/tickets/create-ticket-booking.command-handler';
import { DeleteTicketBookingCommandHandler } from 'src/application/handlers/tickets/delete-ticket-booking.command-handler';
import { FindTicketBookingByEventQueryHandler } from 'src/application/handlers/tickets/find-ticket-booking-by-event.query-handler';
import { GetAllTicketBookingsQueryHandler } from 'src/application/handlers/tickets/get-all-ticket-bookings.query-handler';
import { FindTicketBookingByIdQueryHandler } from 'src/application/handlers/tickets/get-ticket-booking-by-id.query-handler';
import { UpdateTicketBookingCommandHandler } from 'src/application/handlers/tickets/update-ticket-booking.command-handler';
import { TicketBookingProfile } from 'src/application/mappers/ticket-booking.profile';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { BookingHasPromocode } from 'src/domain/entities/booking-has-promocode.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { CREATE_TICKET_BOOKING_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/ticket-booking.repository.token';
import { TicketBookingRepositoryImpl } from 'src/infrastructure/persistence/repositories/ticket-booking.repository.impl';
import { TicketBookingController } from 'src/presentation/controllers/tickets/ticket-booking.controller';

@Module({
  imports: [
    AutomapperModule,
    TypeOrmModule.forFeature([
      TicketBooking,
      BookingHasPayment,
      BookingHasPromocode,
    ]),
    CqrsModule,
  ],
  controllers: [TicketBookingController],
  providers: [
    CreateTicketBookingCommandHandler,
    GetAllTicketBookingsQueryHandler,
    FindTicketBookingByEventQueryHandler,
    FindTicketBookingByIdQueryHandler,
    UpdateTicketBookingCommandHandler,
    DeleteTicketBookingCommandHandler,
    TicketBookingProfile,
    TicketBookingService,
    {
      provide: CREATE_TICKET_BOOKING_REPOSITORY_TOKEN,
      useClass: TicketBookingRepositoryImpl,
    },
  ],
})
export class TicketBookingModule {}
