
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsByDateRangeQuery } from "src/application/queries/events/find-events-by-daterange.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(FindEventsByDateRangeQuery)

export class FindEventsByDateRangeQueryQueryHandler  implements IQueryHandler<FindEventsByDateRangeQuery> {
    constructor(
        private readonly eventService: EventsService,
    ) {}
    execute(query: FindEventsByDateRangeQuery): Promise<Events[] | []> {
        return this.eventService.findByDateRange(query.startDate,query.endDate);
    }
}