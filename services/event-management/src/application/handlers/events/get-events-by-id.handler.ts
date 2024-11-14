import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventsByIdQuery } from "src/application/queries/events/get-events-by-id.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(GetEventsByIdQuery)

export class GetEventsByIdQueryHandler implements IQueryHandler<GetEventsByIdQuery> {
    constructor(
        private readonly eventsService: EventsService,
    ) {}

    async execute(query: GetEventsByIdQuery): Promise<Events | null> {
        const { id } = query;
        return this.eventsService.findOne(id);
    }
}