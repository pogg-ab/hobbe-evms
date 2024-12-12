import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllTicketsHeadingQuery } from "src/application/queries/tickets/get-all-tickets-heading.query";
import { TicketsHeadingService } from "src/application/services/tickets/tickets-heading.service";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";


@QueryHandler(GetAllTicketsHeadingQuery)

export class GetAllTicketsByHeadingQueryHandler implements IQueryHandler<GetAllTicketsHeadingQuery> {
    constructor(
        private readonly ticketsHeadingService : TicketsHeadingService
    ){}

    execute(query: GetAllTicketsHeadingQuery): Promise<{ tickets: TicketsHeading[] | null, total: number; page: number; limit: number}> {
        const { page, limit} = query;
        return this.ticketsHeadingService.findAll(page, limit);
    }
}