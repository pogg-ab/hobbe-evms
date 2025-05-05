import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsSummaryHandler } from 'src/application/handlers/reports/app-user/analytics-summary.handler';
import { CollectDownloadHandler } from 'src/application/handlers/reports/app-user/collect-download.handler';
import { DownloadsByCountryQueryHandler } from 'src/application/handlers/reports/app-user/dowloads-by-country.handler';
import { DownloadsByDateQueryHandler } from 'src/application/handlers/reports/app-user/dowloads-by-date.handler';
import { DownloadsByPlatformQueryHandler } from 'src/application/handlers/reports/app-user/dowloads-by-platform.handler';
import { AnalyticsService } from 'src/application/services/report/analytics.service';
import { DownloadEntity } from 'src/domain/entities/download.entity';
import { ANALYTICS_TOKEN } from 'src/domain/repositories/reports/analytics.repository.token';
import { AnalyticsRepositoryImpl } from 'src/infrastructure/persistence/repositories/analytics.repository.impl';
import { AnalyticsController } from 'src/presentation/controllers/report/analytics.controller';


@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([DownloadEntity])],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    CollectDownloadHandler,
    DownloadsByCountryQueryHandler,
    DownloadsByDateQueryHandler,
    DownloadsByPlatformQueryHandler,
    AnalyticsSummaryHandler,

     {
        provide: ANALYTICS_TOKEN,
        useClass: AnalyticsRepositoryImpl,
    },
],
})
export class AnalyticsModule {}