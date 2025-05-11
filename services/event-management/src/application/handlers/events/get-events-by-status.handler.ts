import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventsByStatusQuery } from "src/application/queries/events/get-events-by-status.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(GetEventsByStatusQuery)

export class GetEventsByStatusQueryHandler implements IQueryHandler<GetEventsByStatusQuery>{
    constructor(
        private readonly eventsService: EventsService,
    ) {}

    async execute(query: GetEventsByStatusQuery): Promise<Events[] | null> {
        const { status } = query;
        return await this.eventsService.findByStatus(status);
    }
}