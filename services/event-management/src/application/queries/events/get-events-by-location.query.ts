import { IQuery } from "@nestjs/cqrs";


export class GetEventsByLocationQuery implements IQuery{
    constructor(public readonly location: string){}
}