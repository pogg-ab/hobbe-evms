import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindEventsByOrganiserQuery } from "src/application/queries/events/find-event-by-organiser.query";
import { EventsService } from "src/application/services/events/events.service";


@QueryHandler(FindEventsByOrganiserQuery)

export class FindByOrganiserQueryHandler  implements IQueryHandler<FindEventsByOrganiserQuery> {
    constructor(
        private readonly eventsService: EventsService
    ){}
    execute(query: FindEventsByOrganiserQuery): Promise<any> {
        const {organiser} = query;
        return this.eventsService.findByOrganiser(organiser);
    }
}