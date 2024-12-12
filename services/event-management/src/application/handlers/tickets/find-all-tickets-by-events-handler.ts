import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindTicketByEventsQuery } from "src/application/queries/tickets/find-all-tickets-by-events.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";


@QueryHandler(FindTicketByEventsQuery)

export class TicketsFindByHeadingQueryHandler implements IQueryHandler<FindTicketByEventsQuery>{
    constructor(
        private readonly ticketsService : TicketsService
    ){}
    execute(query: FindTicketByEventsQuery): Promise<{
        tickets: Tickets[] | null
      }> {
      const { event_id} = query;
      return this.ticketsService.findAllByTicketsEvents(event_id);
    }
    
}

