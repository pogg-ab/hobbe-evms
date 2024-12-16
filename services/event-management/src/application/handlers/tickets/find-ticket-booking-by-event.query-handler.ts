import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTicketBookingByEventQuery } from 'src/application/queries/tickets/find-ticket-booking-by-event.query';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(FindTicketBookingByEventQuery)
export class FindTicketBookingByEventQueryHandler
  implements IQueryHandler<FindTicketBookingByEventQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  execute(
    query: FindTicketBookingByEventQuery,
  ): Promise<TicketBooking[] | null> {
    const { event_id } = query;
    return this.ticketBookingsService.findAllByEvent(event_id);
  }
}
