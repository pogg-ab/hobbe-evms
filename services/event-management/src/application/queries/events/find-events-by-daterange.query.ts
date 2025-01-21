
import { IQuery } from "@nestjs/cqrs";


export class FindEventsByDateRangeQuery implements IQuery{
    constructor(
        public readonly startDate: Date,
        public readonly endDate: Date,
    ){}
}