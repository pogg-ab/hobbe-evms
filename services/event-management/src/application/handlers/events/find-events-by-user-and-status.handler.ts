import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsByUserAndStatusQuery } from "src/application/queries/events/find-events-by-user-and-status.query";
import { EventsService } from "src/application/services/events/events.service";



@QueryHandler(FindEventsByUserAndStatusQuery)

export class FindEventsByUserAndStatusQueryHandler implements IQueryHandler<FindEventsByUserAndStatusQuery> {
    constructor(
        private readonly eventsService: EventsService,
    ) {}

    async execute(query: FindEventsByUserAndStatusQuery) {
        const { user,status } = query;
        return this.eventsService.findByUserAndStatus(user,status);
    }
}