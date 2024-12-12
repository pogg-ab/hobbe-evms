import { TicketsHeading } from "src/domain/entities/tickets-heading.entity"
import { IdValueObject } from "src/domain/value-objects/event-id.value-object"
import { CreateTicketsHeadingDto } from "src/presentation/dtos/tickets/create-tickets-heading.dto"


export interface ITicketsHeadingRepository{
   create(event_id:IdValueObject, createTicketsHeadingDto:CreateTicketsHeadingDto):Promise<TicketsHeading>
   findAll( page:number, limit:number):Promise<{tickets:TicketsHeading[]| null,total: number; page: number; limit: number}>
   findOne( id:string):Promise<TicketsHeading| null>
   activate(id: string, status:string, user: any): Promise<TicketsHeading|null>;
   update(id:string,ticket: TicketsHeading,user: any): Promise<TicketsHeading>


}