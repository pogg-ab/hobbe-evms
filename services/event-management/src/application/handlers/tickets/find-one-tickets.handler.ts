import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOneTicketQuery } from "src/application/queries/tickets/find-one-tickets.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";


@QueryHandler(FindOneTicketQuery)

export class FindOneTicketQueryHandler implements IQueryHandler<FindOneTicketQuery> {
    constructor(private readonly ticketsService: TicketsService) {}
    execute(query: FindOneTicketQuery): Promise<Tickets> {
        const {id} = query;
        return this.ticketsService.findOne(id);
    }
}