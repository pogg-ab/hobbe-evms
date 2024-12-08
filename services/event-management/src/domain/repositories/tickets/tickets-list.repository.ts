
import { CreateTicketsListDto } from "src/presentation/dtos/tickets/create-tickets-list.dto";
import { TicketsList } from "src/domain/entities/tickets_list.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export interface ITicketsListRepository{
    create(createTicketsListDto: CreateTicketsListDto): Promise<TicketsList>;
    getAllTicketsList(ticket_id:IdValueObject):Promise<TicketsList[] | null>
   
}