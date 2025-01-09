import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllSpecialGuests } from 'src/application/queries/special-guest/find-all-special-guests.query';
import { SpecialGuestService } from 'src/application/services/special-guest/special-guest.service';
import { SpecialGuest } from 'src/domain/entities/special-guest.entity';

@QueryHandler(GetAllSpecialGuests)
export class GetAllSpecialGuestsQueryHandler
  implements IQueryHandler<GetAllSpecialGuests>
{
  constructor(private readonly specialGuestService: SpecialGuestService) {}

  async execute(query: GetAllSpecialGuests): Promise<SpecialGuest[]> {
    return this.specialGuestService.findAll();
  }
}
