import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllTicketsListQuery } from "src/application/queries/tickets/get-all-ticketslist.query";
import { TicketsListService } from "src/application/services/tickets/ticketslist.service";
import { TicketsList } from "src/domain/entities/tickets_list.entity";

@QueryHandler(GetAllTicketsListQuery)
export class GetAllTicketsListQueryHandler implements IQueryHandler<GetAllTicketsListQuery> {
    constructor(
        private readonly ticketListService: TicketsListService,  // inject your service here
    ){}
    execute(query: GetAllTicketsListQuery): Promise<{ticketsList:TicketsList[] | null, total: number; page: number; limit: number}> {
      const { page, limit} = query;
      return this.ticketListService.findAll(page, limit);
    }
}