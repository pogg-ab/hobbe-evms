import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventsAllTicketsListCommand } from "src/application/queries/tickets/get-events-all-ticketslist.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { Tickets } from "src/domain/entities/tickets.entity";

@QueryHandler(GetEventsAllTicketsListCommand)
export class GetAllTicketsHandler implements IQueryHandler<GetEventsAllTicketsListCommand> {
  constructor(
    private readonly ticketsService: TicketsService,  // inject your service here
  ) { }
  execute(query: GetEventsAllTicketsListCommand): Promise<Tickets[] | null> {
    const { ticket_id } = query;
    return this.ticketsService.getEventsAllTicketsList(ticket_id)
  }
}