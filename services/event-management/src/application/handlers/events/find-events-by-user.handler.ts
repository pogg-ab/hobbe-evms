import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsByUserQuery } from "src/application/queries/events/find-events-by-user.query";
import { EventsService } from "src/application/services/events/events.service";


@QueryHandler(FindEventsByUserQuery)

export class FindEventsByUserQueryHandler implements IQueryHandler<FindEventsByUserQuery> {
    constructor(
        private readonly eventsService: EventsService,
    ) {}

    async execute(query: FindEventsByUserQuery) {
        const { user } = query;
        return this.eventsService.findByUser(user);
    }
}