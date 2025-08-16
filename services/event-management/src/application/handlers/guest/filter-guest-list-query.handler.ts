import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FilterGuestListQuery } from 'src/application/queries/guest/filter-guest-list.query';
import { GuestsService } from 'src/application/services/guests/guests.service';
import { ParticipantHasTicket } from 'src/domain/entities/participant-has-ticket.entity';

@QueryHandler(FilterGuestListQuery)
export class FilterGuestListQueryHandler
  implements IQueryHandler<FilterGuestListQuery>
{
  constructor(private readonly guestsService: GuestsService) {}

  async execute(query: FilterGuestListQuery): Promise<{
    guests: ParticipantHasTicket[] | null;
    page: number;
    limit: number;
    total: number;
  }> {
    const { status, filters, organizerId, page, limit } = query;

    const result = await this.guestsService.filterGuestList(
      status,
      filters,
      organizerId,
      page,
      limit,
    );

    return {
      guests: result.guests,
      page: page,
      limit: limit,
      total: result.total,
    };
  }
}
