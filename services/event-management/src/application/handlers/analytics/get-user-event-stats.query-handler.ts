import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserEventStatsQuery } from 'src/application/queries/analytics/get-user-event-stats.query';
import { EventsService } from 'src/application/services/events/events.service';

@QueryHandler(GetUserEventStatsQuery)
export class GetUserEventStatsQueryHandler
  implements IQueryHandler<GetUserEventStatsQuery>
{
  constructor(private readonly eventService: EventsService) {}

  async execute(
    query: GetUserEventStatsQuery,
  ): Promise<{ organized: number; participated: number }> {
    const { userId } = query;
    return this.eventService.getUserEventStats(userId);
  }
}
