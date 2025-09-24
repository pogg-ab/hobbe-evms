import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetLiveRevenueDashboardQueryHandler } from 'src/application/handlers/reports/real-time-analytics/real-time-analytics.query.handlers';
import { GetLiveTransactionFeedQueryHandler } from 'src/application/handlers/reports/real-time-analytics/real-time-analytics.query.handlers';
import { RealTimeAnalyticsService } from 'src/application/services/report/real-time-analytics/real-time-analytics.service';
import { Transaction } from 'src/domain/entities/transaction.entity';
import { REAL_TIME_ANALYTICS_REPOSITORY_TOKEN } from 'src/domain/repositories/real-time-analytics/real-time-analytics.repository.token';
import { RealTimeAnalyticsRepositoryImpl } from 'src/infrastructure/persistence/repositories/real-time-analytics.repository.impl';
import { RealTimeAnalyticsController } from 'src/presentation/controllers/report/real-time-analytics/real-time-analytics.controller';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Transaction])],
    controllers: [RealTimeAnalyticsController],
    providers: [
        RealTimeAnalyticsService,
        GetLiveRevenueDashboardQueryHandler,
        GetLiveTransactionFeedQueryHandler,
        {
            provide: REAL_TIME_ANALYTICS_REPOSITORY_TOKEN,
            useClass: RealTimeAnalyticsRepositoryImpl,
        },
    ],
})
export class RealTimeAnalyticsModule { }