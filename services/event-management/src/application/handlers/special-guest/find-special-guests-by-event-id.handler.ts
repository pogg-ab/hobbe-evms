import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FindSpecialGuestsByEventIdQuery } from 'src/application/queries/special-guest/find-special-guests-by-event-id.query';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';

@QueryHandler(FindSpecialGuestsByEventIdQuery)
export class FindSpecialGuestsByEventIdQueryHandler
  implements IQueryHandler<FindSpecialGuestsByEventIdQuery>
{
  constructor(private readonly specialGuestService: SpecialGuestService) {}

  async execute(
    query: FindSpecialGuestsByEventIdQuery,
  ): Promise<SpecialGuest[]> {
    const { eventId } = query;
    return this.specialGuestService.findByEventId(eventId);
  }
}
