import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindTicketsByIdQuery } from "src/application/queries/tickets/find-tickets-by-id.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";


@QueryHandler(FindTicketsByIdQuery)

export class TicketsFindByIdQueryHandler implements IQueryHandler<FindTicketsByIdQuery>{
    constructor(
        private readonly ticketsService : TicketsService
    ){}
    execute(query: FindTicketsByIdQuery): Promise<Tickets | null> {
      const {id} = query;
      return this.ticketsService.findOne(id);
    }
    
}

