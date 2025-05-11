import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { EventSponsorFindById } from 'src/application/queries/event-sponsor/find-event-sponsor-by-id.query';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';

@QueryHandler(EventSponsorFindById)
export class EventSponsorFindByIdQueryHandler
  implements IQueryHandler<EventSponsorFindById>
{
  constructor(private readonly eventSponsorService: EventSponsorService) {}

  async execute(query: EventSponsorFindById): Promise<EventSponsor> {
    const { id } = query;
    return this.eventSponsorService.findOne(id);
  }
}
