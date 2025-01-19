import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetEventRemainingTimeQuery } from 'src/application/queries/events/get-event-remaining-time.query';
import { EventsService } from 'src/application/services/events/events.service';
import { Events } from 'src/domain/entities/events.entity';

@QueryHandler(GetEventRemainingTimeQuery)
export class GetEventRemainingTimeQueryHandler implements IQueryHandler<GetEventRemainingTimeQuery> {
    constructor(
        private readonly eventsService: EventsService,
    ) { }

    async execute(query: GetEventRemainingTimeQuery): Promise<string> {
        const { event_id } = query;
        const event: Events | null = await this.eventsService.findOne(event_id);

        if (!event) {
            throw new Error('Event not found');
        }

        return await this.eventsService.calculateEventRemainingTime(event);
    }
}
