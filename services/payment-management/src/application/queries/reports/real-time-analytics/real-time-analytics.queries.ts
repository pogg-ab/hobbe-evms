import { LiveRevenueDashboardDto } from "src/presentation/dtos/reports/real-time-analytics.dtos";
import { LiveTransactionFeedDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';

export class GetLiveRevenueDashboardQuery {
    constructor(
        public readonly filters: LiveRevenueDashboardDto,
    ) { }
}

export class GetLiveTransactionFeedQuery {
    constructor(
        public readonly filters: LiveTransactionFeedDto,
        public readonly page: number,
        public readonly limit: number,
    ) { }
}