import { IQuery } from "@nestjs/cqrs";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";



export class GetEventsAllTicketsListCommand implements IQuery{
    constructor(public readonly ticket_id:IdValueObject){}
}