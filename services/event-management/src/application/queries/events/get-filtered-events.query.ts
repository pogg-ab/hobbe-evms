import { IQuery } from "@nestjs/cqrs";
import { FilterEventsDto } from "src/presentation/dtos/events/filter-events.dto";

export class GetFilteredEventsQuery implements IQuery {
    constructor(public readonly filterEventsDto: FilterEventsDto) { }
}