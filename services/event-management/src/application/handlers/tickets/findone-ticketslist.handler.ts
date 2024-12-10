import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { TicketsListFindByIdQuery } from "src/application/queries/tickets/findOne.ticketslist.query";
import { TicketsListService } from "src/application/services/tickets/ticketslist.service";
import { TicketsList } from "src/domain/entities/tickets_list.entity";


@QueryHandler(TicketsListFindByIdQuery)

export class TicketsListFindByIdQueryHandler implements IQueryHandler<TicketsListFindByIdQuery>{
    constructor(
        private readonly ticketsListService : TicketsListService
    ){}
    execute(query: TicketsListFindByIdQuery): Promise<TicketsList | null> {
      const {id} = query;
      return this.ticketsListService.findOne(id);
    }
    
}

