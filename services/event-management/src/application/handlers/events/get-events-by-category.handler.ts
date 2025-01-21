import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetEventsByCategoryQuery } from "src/application/queries/events/get-events-by-category.query";
import { EventsService } from "src/application/services/events/events.service";
import { Events } from "src/domain/entities/events.entity";


@QueryHandler(GetEventsByCategoryQuery)

export class GetEventsByCategoryQueryHandler implements IQueryHandler<GetEventsByCategoryQuery>{
    constructor(
        private readonly eventsService: EventsService,
    ) {}

    async execute(query: GetEventsByCategoryQuery): Promise<Events[] | null> {
        const { category } = query;
        return await this.eventsService.findByCategory(category);
    }
}