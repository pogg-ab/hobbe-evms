import { IQuery } from "@nestjs/cqrs";



export class FindTicketHeadingByIdQuery implements IQuery{
    constructor(public readonly id: string){}
}