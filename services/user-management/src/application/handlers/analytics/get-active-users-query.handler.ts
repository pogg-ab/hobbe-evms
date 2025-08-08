import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActiveUsersQuery } from 'src/application/queries/analytics/get-active-users.query';
import { UserAnalyticsService } from 'src/application/services/analytics/user-analytics.service';

@QueryHandler(GetActiveUsersQuery)
export class GetActiveUsersQueryHandler
  implements IQueryHandler<GetActiveUsersQuery>
{
  constructor(private readonly userAnalyticsService: UserAnalyticsService) {}

  async execute(query: GetActiveUsersQuery): Promise<any> {
    const { period, page, limit } = query;
    return this.userAnalyticsService.getActiveUsers(period, page, limit);
  }
}
