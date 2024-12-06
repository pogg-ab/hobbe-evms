
import { CreateTicketsListDto } from "src/presentation/dtos/tickets/create-tickets-list.dto";
import { TicketsList } from "src/domain/entities/tickets_list.entity";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export interface ITicketsListRepository{
    create(createTicketsListDto: CreateTicketsListDto): Promise<TicketsList>;
    // findAll( page:number, limit:number):Promise<{events:Events[]| null,total: number; page: number; limit: number}>
    // findOne(id:string):Promise<Events | null>
     getAllTicketsList(ticket_id:IdValueObject):Promise<TicketsList[] | null>
    // findByLocation(location:string):Promise<Events[]>
    // update(id:string,event: Events,user: any): Promise<Events>
    // delete(id:string): Promise<void>

    // // searching for events
    // search(keyword:string,page:number,limit:number):Promise<{events:Events[] | null,total:number, page: number; limit: number}>
}