import { IQuery } from "@nestjs/cqrs";

export class GetUserTicketsQuery implements IQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly userId: string,
        public readonly ticketCategory: 'upcoming' | 'past' | 'gifted',
    ) { }
}
