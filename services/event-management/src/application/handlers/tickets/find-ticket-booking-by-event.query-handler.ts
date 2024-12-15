import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTicketBookingByEventQuery } from 'src/application/queries/ticket-booking/find-ticket-booking-by-event.query';
import { TicketBookingsService } from 'src/application/services/ticket-bookings/ticket-bookings.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(FindTicketBookingByEventQuery)
export class FindTicketBookingByEventQueryHandler
  implements IQueryHandler<FindTicketBookingByEventQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingsService) {}

  execute(
    query: FindTicketBookingByEventQuery,
  ): Promise<TicketBooking[] | null> {
    const { event_id } = query;
    return this.ticketBookingsService.findByEvent(event_id);
  }
}
