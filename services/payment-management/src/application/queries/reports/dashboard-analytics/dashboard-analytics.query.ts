import { DashboardAnalyticsDto } from 'src/presentation/dtos/reports/dashboard-analytics.dto';

export class DashboardAnalyticsQuery {
  constructor(public readonly filters: DashboardAnalyticsDto) {}
}
