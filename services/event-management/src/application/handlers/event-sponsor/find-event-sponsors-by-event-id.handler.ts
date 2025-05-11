import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindEventSponsorsByEventIdQuery } from 'src/application/queries/event-sponsor/find-event-sponsors-by-event-id.query';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';

@QueryHandler(FindEventSponsorsByEventIdQuery)
export class FindEventSponsorsByEventIdQueryHandler
  implements IQueryHandler<FindEventSponsorsByEventIdQuery>
{
  constructor(private readonly eventSponsorService: EventSponsorService) {}

  async execute(
    query: FindEventSponsorsByEventIdQuery,
  ): Promise<EventSponsor[]> {
    const { eventId } = query;
    return this.eventSponsorService.findByEventId(eventId);
  }
}
