import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SpecialGuestFindById } from 'src/application/queries/special-guest/find-special-guest-by-id.query';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';

@QueryHandler(SpecialGuestFindById)
export class SpecialGuestFindByIdQueryHandler
  implements IQueryHandler<SpecialGuestFindById>
{
  constructor(private readonly specialGuestService: SpecialGuestService) {}

  async execute(query: SpecialGuestFindById): Promise<SpecialGuest> {
    const { id } = query;
    return this.specialGuestService.findOne(id);
  }
}
