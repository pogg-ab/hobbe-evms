import { IQuery } from "@nestjs/cqrs";



export class FindTicketByHeadingQuery implements IQuery{
    constructor(
        public readonly ticket_heading_id: string,
        // public readonly page: number,
        // public readonly limit: number,
        public readonly tickets_type?: string,
        public readonly status?: string,
    ){}
}