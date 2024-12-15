import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTicketBookingByIdQuery } from 'src/application/queries/ticket-booking/find-ticket-booking-by-id.query';
import { TicketBookingsService } from 'src/application/services/ticket-bookings/ticket-bookings.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(FindTicketBookingByIdQuery)
export class FindTicketBookingByIdQueryHandler
  implements IQueryHandler<FindTicketBookingByIdQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingsService) {}

  execute(query: FindTicketBookingByIdQuery): Promise<TicketBooking | null> {
    const { id } = query;
    return this.ticketBookingsService.findById(id);
  }
}
