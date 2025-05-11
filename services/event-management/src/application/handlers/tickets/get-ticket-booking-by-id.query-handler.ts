import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketBookingByIdQuery } from 'src/application/queries/tickets/get-ticket-booking-by-id.query';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(GetTicketBookingByIdQuery)
export class FindTicketBookingByIdQueryHandler
  implements IQueryHandler<GetTicketBookingByIdQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  execute(query: GetTicketBookingByIdQuery): Promise<TicketBooking | null> {
    const { id } = query;
    return this.ticketBookingsService.getTicketBookingById(id);
  }
}
