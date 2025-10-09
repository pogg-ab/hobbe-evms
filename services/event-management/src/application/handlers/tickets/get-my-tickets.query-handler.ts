import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetMyTicketsQuery } from "src/application/queries/tickets/get-my-tickets.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";

@QueryHandler(GetMyTicketsQuery)
export class GetMyTicketsQueryHandler implements IQueryHandler<GetMyTicketsQuery> {
    constructor(
        private readonly ticketsService: TicketsService,
    ) { }

    async execute(query: GetMyTicketsQuery): Promise<any> {
        const { userId, page, limit } = query;
        return await this.ticketsService.getMyTickets(userId,page, limit);
    }
}
