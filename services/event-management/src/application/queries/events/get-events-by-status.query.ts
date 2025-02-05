import { IQuery } from "@nestjs/cqrs";


export class GetEventsByStatusQuery implements IQuery{
    constructor(public readonly status: string) {}
}