
import { CreateTicketsDto } from "src/presentation/dtos/tickets/create-tickets.dto";
import { Tickets } from "src/domain/entities/tickets.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export interface ITicketsRepository{
    create(createTicketsDto: CreateTicketsDto): Promise<void>;
    findAll( page:number, limit:number):Promise<{ticketsList:Tickets[] | null,total: number; page: number; limit: number}>
    findOne(id: string): Promise<Tickets|null>;
    getEventsAllTicketsList(ticket_heading_id:IdValueObject):Promise<Tickets[] | null>
   
}