import { IQuery } from "@nestjs/cqrs";


export class GetEventsByIdQuery implements IQuery {
    constructor(public readonly id: string) {}
}