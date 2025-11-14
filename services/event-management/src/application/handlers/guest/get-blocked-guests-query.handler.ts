import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlockedGuestsQuery } from 'src/application/queries/guest/get-blocked-guests.query';
import { GuestsService } from 'src/application/services/guests/guests.service';

@QueryHandler(GetBlockedGuestsQuery)
export class GetBlockedGuestsQueryHandler
  implements IQueryHandler<GetBlockedGuestsQuery>
{
  constructor(private readonly guestService: GuestsService) {}

  async execute(query: GetBlockedGuestsQuery): Promise<any[]> {
    const { organizerId } = query;
    return this.guestService.getBlockedGuestsByOrganizer(organizerId);
  }
}
