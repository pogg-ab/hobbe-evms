import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventsByLocationQuery } from "src/application/queries/events/get-events-by-location.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(GetEventsByLocationQuery)

export class GetEventsByLocationQueryHandler implements IQueryHandler<GetEventsByLocationQuery> {
    constructor(
        private readonly eventsService: EventsService,
    ) {}

    async execute(query: GetEventsByLocationQuery): Promise<Events[] | null> {
        const { location } = query;
        return this.eventsService.findByLocation(location);
    }
}