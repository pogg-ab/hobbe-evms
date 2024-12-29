import { IQuery } from "@nestjs/cqrs";


export class FindEventsByUserQuery implements IQuery {
    constructor(public readonly user: string) {}
}