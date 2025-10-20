import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetParticipatedEventsQuery } from 'src/application/queries/events/get-participated-events.query';
import { EventsService } from '../../services/events/events.service';
import { Events } from 'src/domain/entities/events.entity';

@QueryHandler(GetParticipatedEventsQuery)
export class GetParticipatedEventsQueryHandler
  implements IQueryHandler<GetParticipatedEventsQuery>
{
  constructor(private readonly eventsService: EventsService) {}

  async execute(query: GetParticipatedEventsQuery): Promise<{
    events: Events[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const { userId, page, limit } = query;

    return this.eventsService.findParticipatedByUser(userId, page, limit);
  }
}
