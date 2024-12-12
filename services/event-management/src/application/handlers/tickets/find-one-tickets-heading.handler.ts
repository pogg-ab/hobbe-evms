import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindTicketHeadingByIdQuery } from "src/application/queries/tickets/find-tickets-heading-by-id.query";
import { TicketsHeadingService } from "src/application/services/tickets/tickets-heading.service";
import { TicketsHeading } from "src/domain/entities/tickets-heading.entity";


@QueryHandler(FindTicketHeadingByIdQuery)

export class FindOneTicketsHeadingQueryHandler implements IQueryHandler<FindTicketHeadingByIdQuery> {
    constructor(private readonly ticketsHeadingService: TicketsHeadingService) {}
    execute(query: FindTicketHeadingByIdQuery): Promise<TicketsHeading> {
        const {id} = query;
        return this.ticketsHeadingService.findOne(id);
    }
}