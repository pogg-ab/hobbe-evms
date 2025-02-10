import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from 'src/application/services/user.service';
import { SearchUsersQuery } from 'src/application/queries/user/search-users.query';
import { User } from 'src/domain/entities/user.entity';

@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<SearchUsersQuery> {
    constructor(private readonly userService: UserService) { }

    async execute(query: SearchUsersQuery): Promise<void> {
        // return this.userService.searchUsers(query.searchTerm);
    }
}
