import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AnalyticsSummary } from 'src/application/queries/reports/app-users/analytics-summary.query';
import { AnalyticsService } from 'src/application/services/report/analytics.service';

@QueryHandler(AnalyticsSummary)
export class AnalyticsSummaryHandler
  implements IQueryHandler<AnalyticsSummary>
{
  constructor(
    private readonly analyticsService: AnalyticsService, // Replace with actual service type
  ) {}
  async execute(): Promise<any> {
    return this.analyticsService.getAnalyticsSummary();
  }
}
