import { IQuery } from "@nestjs/cqrs";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export class FindTicketsByIdQuery implements IQuery{
    constructor(
        public readonly id:string
    ){}
}