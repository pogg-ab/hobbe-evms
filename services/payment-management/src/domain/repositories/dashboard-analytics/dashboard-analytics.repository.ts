import { DashboardAnalyticsDto } from 'src/presentation/dtos/reports/dashboard-analytics.dto';

export interface IDashboardAnalyticsRepository {
  findDashboardAnalytics(filters: DashboardAnalyticsDto): Promise<any>;
}
