import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsByThisWeekendQuery } from "src/application/queries/events/find-event-by-this-weekend.query";
import { EventsService } from "src/application/services/events/events.service";


@QueryHandler(FindEventsByThisWeekendQuery)

export class FindEventsByThisWeekendQueryHandler implements IQueryHandler<FindEventsByThisWeekendQuery> {
    constructor(
        private readonly eventsService: EventsService
    ) {}
    execute(query: FindEventsByThisWeekendQuery): Promise<any> {
        return this.eventsService.findByThisWeek();
    }
}