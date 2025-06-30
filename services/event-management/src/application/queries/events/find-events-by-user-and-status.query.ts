import { IQuery } from "@nestjs/cqrs";


export class FindEventsByUserAndStatusQuery implements IQuery {
    constructor(
        public readonly user: string,
        public readonly status: string
    ) {}
}