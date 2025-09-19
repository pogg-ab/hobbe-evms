import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchTicketsQuery } from 'src/application/queries/support/search-tickets.query';
import { TicketService } from 'src/application/services/support/ticket.service';

@QueryHandler(SearchTicketsQuery)
export class SearchTicketsQueryHandler
  implements IQueryHandler<SearchTicketsQuery>
{
  constructor(private readonly ticketService: TicketService) {}

  async execute(query: SearchTicketsQuery): Promise<any[]> {
    const tickets = await this.ticketService.searchTickets(query.dto);
    return tickets;
  }
}
