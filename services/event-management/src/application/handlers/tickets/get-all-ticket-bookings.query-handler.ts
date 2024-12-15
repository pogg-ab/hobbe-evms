import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllTicketBookingsQuery } from 'src/application/queries/ticket-booking/get-all-ticket-bookings.query';
import { TicketBookingsService } from 'src/application/services/ticket-bookings/ticket-bookings.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(GetAllTicketBookingsQuery)
export class GetAllTicketBookingsQueryHandler
  implements IQueryHandler<GetAllTicketBookingsQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingsService) {}

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
