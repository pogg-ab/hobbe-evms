import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindTicketBookingsByTicketBuyerQuery } from 'src/application/queries/tickets/find-ticket-booking-by-ticket-buyer.query';
import { TicketBookingService } from 'src/application/services/tickets/ticket-booking/ticket-booking.service';
import { TicketBooking } from 'src/domain/entities/ticket-booking.entity';

@QueryHandler(FindTicketBookingsByTicketBuyerQuery)
export class FindTicketBookingsByTicketBuyerQueryHandler
  implements IQueryHandler<FindTicketBookingsByTicketBuyerQuery>
{
  constructor(private readonly ticketBookingsService: TicketBookingService) {}

  execute(
    query: FindTicketBookingsByTicketBuyerQuery,
  ): Promise<TicketBooking[] | null> {
    const { ticketBuyerId } = query;
    return this.ticketBookingsService.findAllByTicketBuyer(ticketBuyerId);
  }
}
