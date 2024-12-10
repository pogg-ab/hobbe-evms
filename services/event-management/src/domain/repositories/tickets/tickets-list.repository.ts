
import { CreateTicketsListDto } from "src/presentation/dtos/tickets/create-tickets-list.dto";
import { TicketsList } from "src/domain/entities/tickets_list.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export interface ITicketsListRepository{
    create(createTicketsListDto: CreateTicketsListDto): Promise<void>;
    findAll( page:number, limit:number):Promise<{ticketsList:TicketsList[] | null,total: number; page: number; limit: number}>
    findOne(id: string): Promise<TicketsList|null>;
    getEventsAllTicketsList(ticket_id:IdValueObject):Promise<TicketsList[] | null>
   
}