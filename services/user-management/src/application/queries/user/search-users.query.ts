import { IQuery } from '@nestjs/cqrs';
import { SearchFilters } from 'src/presentation/dtos/search-filters.dto';

export class SearchUsersQuery {
    constructor(
        public readonly query: string,
        public readonly filters: SearchFilters,
        public readonly page: number,
        public readonly limit: number,
    ) { }
}