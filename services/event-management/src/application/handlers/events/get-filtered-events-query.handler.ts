import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetFilteredEventsQuery } from "../../queries/events/get-filtered-events.query";
import { EventsService } from "../../services/events/events.service";
import { Events } from "src/domain/entities/events.entity";

@QueryHandler(GetFilteredEventsQuery)
export class GetFilteredEventsQueryHandler implements IQueryHandler<GetFilteredEventsQuery> {
    constructor(private readonly eventsService: EventsService) { }

    async execute(query: GetFilteredEventsQuery): Promise<{
        events: Events[] | null;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { filterEventsDto } = query;
        return this.eventsService.findFiltered(filterEventsDto);
    }
}