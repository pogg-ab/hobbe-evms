import { Tickets } from "src/domain/entities/tickets.entity"
import { IdValueObject } from "src/domain/value-objects/event-id.value-object"
import { CreateTicketsDto } from "src/presentation/dtos/tickets/create-tickets.dto"


export interface ITicketsRepository{
   create(event_id:IdValueObject, createTicketsDto:CreateTicketsDto):Promise<Tickets>
   findAll( page:number, limit:number):Promise<{tickets:Tickets[]| null,total: number; page: number; limit: number}>
   findOne( id:string):Promise<Tickets| null>
   update(id:string,ticket: Tickets,user: any): Promise<Tickets>


}