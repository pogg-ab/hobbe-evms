import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindTicketByHeadingQuery } from "src/application/queries/tickets/find-all-tickets-by-heading.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";


@QueryHandler(FindTicketByHeadingQuery)

export class TicketsFindByHeadingQueryHandler implements IQueryHandler<FindTicketByHeadingQuery> {
    constructor(
        private readonly ticketsService: TicketsService
    ) { }
    execute(query: FindTicketByHeadingQuery): Promise<{
        tickets: Tickets[] | null
    }> {
        const { ticket_heading_id, tickets_type, status } = query;
        return this.ticketsService.findAllByTicketsHeading(ticket_heading_id, tickets_type, status);
    }

}

