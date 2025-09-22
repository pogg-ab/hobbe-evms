import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DashboardAnalyticsService } from 'src/application/services/report/dashboard-analytics/dashboard-analytics.service';
import { DashboardAnalyticsQuery } from 'src/application/queries/reports/dashboard-analytics/dashboard-analytics.query';
@QueryHandler(DashboardAnalyticsQuery)
export class DashboardAnalyticsQueryHandler
  implements IQueryHandler<DashboardAnalyticsQuery>
{
  constructor(
    private readonly dashboardAnalyticsService: DashboardAnalyticsService,
  ) {}

  async execute(query: DashboardAnalyticsQuery): Promise<any> {
    return await this.dashboardAnalyticsService.getDashboardAnalytics(
      query.filters,
    );
  }
}
