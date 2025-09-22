import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IDashboardAnalyticsRepository } from 'src/domain/repositories/dashboard-analytics/dashboard-analytics.repository';
import { DASHBOARD_ANALYTICS_REPOSITORY_TOKEN } from 'src/domain/repositories/dashboard-analytics/dashboard-analytics.repository.token';
import { DashboardAnalyticsDto } from 'src/presentation/dtos/reports/dashboard-analytics.dto';

@Injectable()
export class DashboardAnalyticsService {
  constructor(
    @Inject(DASHBOARD_ANALYTICS_REPOSITORY_TOKEN)
    private readonly dashboardAnalyticsRepository: IDashboardAnalyticsRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async getDashboardAnalytics(filters: DashboardAnalyticsDto): Promise<any> {
    const result =
      await this.dashboardAnalyticsRepository.findDashboardAnalytics(filters);
    const data = result.data;
    return {
      data,
    };
  }
}
