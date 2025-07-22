import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserService } from 'src/application/services/user.service';
import { FindActiveUsersQuery } from 'src/application/queries/user/find-active-users.query';

@QueryHandler(FindActiveUsersQuery)
export class FindActiveUsersQueryHandler
  implements IQueryHandler<FindActiveUsersQuery>
{
  constructor(private readonly userService: UserService) {}

  async execute(query: FindActiveUsersQuery): Promise<any | null> {
    const { page, limit } = query;
    return this.userService.findActiveUsers(page, limit);
  }
}
