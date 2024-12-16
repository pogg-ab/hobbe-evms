import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketBookingProfile } from 'src/application/mappers/ticket-booking.profile';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { BookingHasPayment } from 'src/domain/entities/booking-has-payment.entity';
import { BookingHasPromocode } from 'src/domain/entities/booking-has-promocode.entity';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';
import { CREATE_TICKET_REPOSITORY_TOKEN } from 'src/domain/repositories/tickets/tickets.repository.token';
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
    TicketBookingProfile,
    TicketBookingService,
    {
      provide: CREATE_TICKET_REPOSITORY_TOKEN,
      useClass: TicketBookingRepositoryImpl,
    },
  ],
})
export class TicketBookingModule {}
