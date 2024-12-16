import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllTicketBookingsQuery } from 'src/application/queries/tickets/get-all-ticket-bookings.query';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(GetAllTicketBookingsQuery)
export class GetAllTicketBookingsQueryHandler
  implements IQueryHandler<GetAllTicketBookingsQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  execute(query: GetAllTicketBookingsQuery): Promise<{
    ticketBookings: TicketBooking[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = query;
    return this.ticketBookingsService.findAll(page, limit);
  }
}
