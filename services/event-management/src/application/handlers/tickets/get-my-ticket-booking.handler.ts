import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTicketBookingsByTicketBuyerQuery } from 'src/application/queries/tickets/find-ticket-booking-by-ticket-buyer.query';
import { GetMyTicketBookingQuery } from 'src/application/queries/tickets/get-my-ticket-booking.query';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(GetMyTicketBookingQuery)
export class GetMyTicketBookingQueryHandler
  implements IQueryHandler<GetMyTicketBookingQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  execute(query: GetMyTicketBookingQuery): Promise<TicketBooking[] | null> {
    const { userId } = query;
    return this.ticketBookingsService.getMyTicketBooking(userId);
  }
}
