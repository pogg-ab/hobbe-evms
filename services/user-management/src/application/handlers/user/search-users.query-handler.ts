import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from 'src/application/services/user.service';
import { SearchUsersQuery } from 'src/application/queries/user/search-users.query';
import { User } from 'src/domain/entities/user.entity';

@QueryHandler(SearchUsersQuery)
export class SearchUsersQueryHandler implements IQueryHandler<SearchUsersQuery> {
    constructor(private readonly userService: UserService) { }

    async execute(query: SearchUsersQuery): Promise<User[]> {
        const { query: searchTerm, filters, page, limit } = query;
        return await this.userService.searchUsers(searchTerm, filters, page, limit);
    }
}
