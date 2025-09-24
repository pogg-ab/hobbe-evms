import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RealTimeAnalyticsService } from 'src/application/services/report/real-time-analytics/real-time-analytics.service';
import { GetLiveRevenueDashboardQuery } from 'src/application/queries/reports/real-time-analytics/real-time-analytics.queries';
import { GetLiveTransactionFeedQuery } from 'src/application/queries/reports/real-time-analytics/real-time-analytics.queries';

@QueryHandler(GetLiveRevenueDashboardQuery)
export class GetLiveRevenueDashboardQueryHandler
    implements IQueryHandler<GetLiveRevenueDashboardQuery> {
    constructor(
        private readonly realTimeAnalyticsService: RealTimeAnalyticsService,
    ) { }

    async execute(query: GetLiveRevenueDashboardQuery): Promise<{
        data: any[];
        total: number;
    }> {
        return await this.realTimeAnalyticsService.getLiveRevenueDashboard(
            query.filters,
        );
    }
}

@QueryHandler(GetLiveTransactionFeedQuery)
export class GetLiveTransactionFeedQueryHandler
    implements IQueryHandler<GetLiveTransactionFeedQuery> {
    constructor(
        private readonly realTimeAnalyticsService: RealTimeAnalyticsService,
    ) { }

    async execute(query: GetLiveTransactionFeedQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.realTimeAnalyticsService.getLiveTransactionFeed(
            query.filters,
            query.page,
            query.limit,
        );
    }
}