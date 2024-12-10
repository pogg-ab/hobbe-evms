import { IQuery } from "@nestjs/cqrs";
import { IdValueObject } from "src/domain/value-objects/event-id.value-object";


export class TicketsListFindByIdQuery implements IQuery{
    constructor(
        public readonly id:string
    ){}
}