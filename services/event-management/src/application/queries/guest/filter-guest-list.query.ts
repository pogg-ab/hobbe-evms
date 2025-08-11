import { IQuery } from '@nestjs/cqrs';
import { FilterGuestListDto } from 'src/presentation/dtos/guest/filter-guest-list.dto';

export class FilterGuestListQuery implements IQuery {
  constructor(
    public readonly status:
      | 'purchased'
      | 'arrived'
      | 'canceled'
      | 'gifted'
      | 'pending',
    public readonly filters: FilterGuestListDto,
    public readonly organizerId: string,
  ) {}
}
