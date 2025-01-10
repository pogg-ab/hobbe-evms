import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsBySpecificDate } from "src/application/queries/events/find-event-by-specific-date.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(FindEventsBySpecificDate)

export class FindEventsBySpecificDateQueryHandler  implements IQueryHandler<FindEventsBySpecificDate> {
    constructor(
        private readonly eventService: EventsService,
    ) {}
    execute(query: FindEventsBySpecificDate): Promise<Events[] | []> {
        return this.eventService.findBySpecificDate(query.specificDate)
    }
}