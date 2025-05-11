import { IQuery } from "@nestjs/cqrs";

export class FindEventsByThisWeekendQuery implements IQuery{
    constructor(){}
}