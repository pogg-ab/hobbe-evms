import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTicketBookingsByEventOrganizerQuery } from 'src/application/queries/tickets/find-ticket-booking-by-event-organizer.query';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(FindTicketBookingsByEventOrganizerQuery)
export class FindTicketBookingsByEventOrganizerQueryHandler
  implements IQueryHandler<FindTicketBookingsByEventOrganizerQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  execute(
    query: FindTicketBookingsByEventOrganizerQuery,
  ): Promise<{ event: Event; ticketBookings: TicketBooking[] }[] | null> {
    const { eventOrganizerId } = query;
    return this.ticketBookingsService.findAllByEventOrganizer(eventOrganizerId);
  }
}
