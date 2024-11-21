import { IQuery } from "@nestjs/cqrs";


export class GetEventsByCategoryQuery implements IQuery{
    constructor(public readonly category: string) {}
}