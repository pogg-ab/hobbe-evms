import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllTicketsListCommand } from "src/application/queries/tickets/get-all-ticketslist.command";
import { TicketsService } from "src/application/services/tickets/tickets.service";
import { TicketsList } from "src/domain/entities/tickets_list.entity";

@QueryHandler(GetAllTicketsListCommand)
export class GetAllTicketsListHandler implements IQueryHandler<GetAllTicketsListCommand> {
    constructor(
        private readonly ticketService: TicketsService,  // inject your service here
    ){}
    execute(query: GetAllTicketsListCommand): Promise<TicketsList[] | null> {
      const { ticket_id} = query;
      return this.ticketService.getAllTicketsList(ticket_id)
    }
}