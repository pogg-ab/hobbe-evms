import { IQuery } from "@nestjs/cqrs";



export class FindOneTicketQuery implements IQuery{
    constructor(public readonly id: string){}
}