import { IQuery } from "@nestjs/cqrs";



export class FindTicketByEventsQuery implements IQuery{
    constructor(
        public readonly event_id: string,
        // public readonly page: number,
        // public readonly limit: number,
    ){}
}