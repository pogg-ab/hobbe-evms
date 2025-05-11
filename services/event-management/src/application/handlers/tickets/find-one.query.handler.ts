import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindOneQuery } from "src/application/queries/tickets/find-one.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";


@QueryHandler(FindOneQuery)

export class FindOneQueryHandler implements IQueryHandler<FindOneQuery>{
    constructor(
        private readonly ticketService:TicketsService,
    ){}
    execute(query: FindOneQuery): Promise<Tickets | null> {
        return this.ticketService.findOne(query.id);
    }

    
}