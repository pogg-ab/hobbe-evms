import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserTicketsQuery } from "src/application/queries/tickets/get-user-tickets.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { ParticipantHasTicket } from "src/domain/entities/participant-has-ticket.entity";

@QueryHandler(GetUserTicketsQuery)
export class GetUserTicketsQueryHandler implements IQueryHandler<GetUserTicketsQuery> {
    constructor(
        private readonly ticketsService: TicketsService,
    ) { }

    async execute(query: GetUserTicketsQuery): Promise<{ groupedTickets: any | null, total: number; page: number; limit: number }> {
        const { page, limit, userId, ticketCategory } = query;
        return await this.ticketsService.findByCategory(page, limit, userId, ticketCategory);
    }
}
