import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchTicketsQuery } from 'src/application/queries/freshdesk/search-tickets.query';
import { TicketService } from 'src/application/services/freshdesk/ticket.service';
import { TicketResponseDto } from 'src/presentation/dto/freshdesk/ticket/ticket.dto';

@QueryHandler(SearchTicketsQuery)
export class SearchTicketsQueryHandler implements IQueryHandler<SearchTicketsQuery> {
    constructor(private readonly ticketService: TicketService) { }

    async execute(query: SearchTicketsQuery): Promise<TicketResponseDto[]> {
        const { query: searchQuery } = query;
        return this.ticketService.searchTickets(searchQuery);
    }
}