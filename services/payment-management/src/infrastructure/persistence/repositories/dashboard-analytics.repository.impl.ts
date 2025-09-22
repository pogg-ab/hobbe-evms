import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { IDashboardAnalyticsRepository } from 'src/domain/repositories/dashboard-analytics/dashboard-analytics.repository';
import { DashboardAnalyticsDto } from 'src/presentation/dtos/reports/dashboard-analytics.dto';

@Injectable()
export class DashboardAnalyticsRepositoryImpl
  implements IDashboardAnalyticsRepository
{
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  private async dashboardAnalyticsFunction(
    startDate: string | undefined,
    endDate: string | undefined,
  ): Promise<{ metric: string; value: number }[]> {
    try {
      const result = await this.connection.query(
        `SELECT * FROM fn_dashboard_analytics($1::date, $2::date)`,
        [startDate || null, endDate || null],
      );
      console.log(
        `✅ Executed fn_dashboard_analytics for startDate: ${startDate}, endDate: ${endDate}`,
      );
      return result;
    } catch (error) {
      console.error('Error calling fn_dashboard_analytics:', error);
      throw new Error(`Failed to fetch dashboard analytics: ${error.message}`);
    }
  }

  async findDashboardAnalytics(filters: DashboardAnalyticsDto): Promise<any> {
    const { timeRange } = filters;
    const startDate = timeRange?.start
      ? new Date(timeRange.start).toISOString().split('T')[0]
      : undefined;
    const endDate = timeRange?.end
      ? new Date(timeRange.end).toISOString().split('T')[0]
      : undefined;

    let data = await this.dashboardAnalyticsFunction(startDate, endDate);

    return {
      data: data.length ? data : null,
    };
  }
}
