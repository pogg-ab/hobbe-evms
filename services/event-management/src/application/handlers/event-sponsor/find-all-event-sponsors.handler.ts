import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllEventSponsors } from 'src/application/queries/event-sponsor/find-all-event-sponsors.query';
import { EventSponsorService } from 'src/application/services/event-sponsor/event-sponsor.service';
import { EventSponsor } from 'src/domain/entities/event-sponsor.entity';

@QueryHandler(GetAllEventSponsors)
export class GetAllEventSponsorsQueryHandler
  implements IQueryHandler<GetAllEventSponsors>
{
  constructor(private readonly eventSponsorService: EventSponsorService) {}

  async execute(query: GetAllEventSponsors): Promise<EventSponsor[]> {
    return this.eventSponsorService.findAll();
  }
}
