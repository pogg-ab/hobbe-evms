import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchAllUsersQuery } from 'src/application/queries/user/search-all-users.query';
import { UserService } from 'src/application/services/user.service';
import { User } from 'src/domain/entities/user.entity';

@QueryHandler(SearchAllUsersQuery)
export class SearchAllUsersQueryHandler
  implements IQueryHandler<SearchAllUsersQuery>
{
  constructor(private readonly userService: UserService) {}

  async execute(query: SearchAllUsersQuery): Promise<{
    users: any[] | null;
    total: number;
    page: number;
    limit: number;
  }> {
    const { query: searchTerm, filters, page, limit } = query;

    return await this.userService.searchAllUsers(
      searchTerm,
      filters,
      page,
      limit,
    );
  }
}
