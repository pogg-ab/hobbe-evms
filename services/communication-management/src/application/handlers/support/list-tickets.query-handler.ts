import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListTicketsQuery } from 'src/application/queries/support/list-tickets.query';
import { TicketService } from 'src/application/services/support/ticket.service';
import { TicketResponseDto } from 'src/presentation/dto/support/ticket/ticket.dto';

@QueryHandler(ListTicketsQuery)
export class ListTicketsQueryHandler implements IQueryHandler<ListTicketsQuery> {
    constructor(private readonly ticketService: TicketService) { }

    async execute(query: ListTicketsQuery): Promise<TicketResponseDto[]> {
        const { page, perPage, } = query;
        return this.ticketService.findAllTickets(page, perPage,);
    }
}