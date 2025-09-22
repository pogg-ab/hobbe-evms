import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DashboardAnalyticsController } from 'src/presentation/controllers/report/dashboard-analytics/dashboard-analytics.controller';
import { DashboardAnalyticsService } from 'src/application/services/report/dashboard-analytics/dashboard-analytics.service';
import { DashboardAnalyticsRepositoryImpl } from 'src/infrastructure/persistence/repositories/dashboard-analytics.repository.impl';
import { DashboardAnalyticsQueryHandler } from 'src/application/handlers/reports/dashboard-analytics/dashboard-analytics.query.handler';
import { DASHBOARD_ANALYTICS_REPOSITORY_TOKEN } from 'src/domain/repositories/dashboard-analytics/dashboard-analytics.repository.token';

@Module({
  imports: [CqrsModule],
  controllers: [DashboardAnalyticsController],
  providers: [
    DashboardAnalyticsService,
    {
      provide: DASHBOARD_ANALYTICS_REPOSITORY_TOKEN,
      useClass: DashboardAnalyticsRepositoryImpl,
    },
    DashboardAnalyticsQueryHandler,
  ],
})
export class DashboardAnalyticsModule {}
