import { SearchTicketsDto } from 'src/presentation/dto/support/ticket/search-tickets.dto';

export class SearchTicketsQuery {
  constructor(public readonly dto: SearchTicketsDto) {}
}
