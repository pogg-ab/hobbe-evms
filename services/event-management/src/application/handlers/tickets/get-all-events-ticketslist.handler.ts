import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventsAllTicketsListCommand } from "src/application/queries/tickets/get-events-all-ticketslist.query";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { TicketsListService } from "src/application/services/tickets/ticketslist.service";
import { TicketsList } from "src/domain/entities/tickets_list.entity";

@QueryHandler(GetEventsAllTicketsListCommand)
export class GetAllTicketsListHandler implements IQueryHandler<GetEventsAllTicketsListCommand> {
    constructor(
        private readonly ticketListService: TicketsListService,  // inject your service here
    ){}
    execute(query: GetEventsAllTicketsListCommand): Promise<TicketsList[] | null> {
      const { ticket_id} = query;
      return this.ticketListService.getEventsAllTicketsList(ticket_id)
    }
}