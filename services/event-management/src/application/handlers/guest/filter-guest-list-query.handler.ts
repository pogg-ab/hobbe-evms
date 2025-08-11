import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FilterGuestListQuery } from 'src/application/queries/guest/filter-guest-list.query';
import { GuestsService } from 'src/application/services/guests/guests.service';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';

@QueryHandler(FilterGuestListQuery)
export class FilterGuestListQueryHandler
  implements IQueryHandler<FilterGuestListQuery>
{
  constructor(private readonly guestsService: GuestsService) {}

  async execute(
    query: FilterGuestListQuery,
  ): Promise<{ guests: ParticipantHasTicket[] | null }> {
    const { status, filters } = query;
    return this.guestsService.filterGuestList(status, filters);
  }
}
