import { LiveRevenueDashboardDto } from "src/presentation/dtos/reports/real-time-analytics.dtos";
import { LiveTransactionFeedDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';

export interface IRealTimeAnalyticsRepository {
    findLiveRevenue(
        filters: LiveRevenueDashboardDto,
    ): Promise<{
        data: any[] | null;
        total: number;
    }>;

    findLiveTransactions(
        filters: LiveTransactionFeedDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }>;
}