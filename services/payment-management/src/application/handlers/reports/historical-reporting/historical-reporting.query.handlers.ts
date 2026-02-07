import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { HistoricalReportingService } from 'src/application/services/report/historical-reporting/historical-reporting.service';
import { GetDailyMonthlyRevenueReportQuery } from 'src/application/queries/reports/historical-reporting/historical-reporting.queries';
import { GetRefundReportQuery } from 'src/application/queries/reports/historical-reporting/historical-reporting.queries';
import { GetPaymentMethodReportQuery } from 'src/application/queries/reports/historical-reporting/historical-reporting.queries';

@QueryHandler(GetDailyMonthlyRevenueReportQuery)
export class GetDailyMonthlyRevenueReportQueryHandler
    implements IQueryHandler<GetDailyMonthlyRevenueReportQuery> {
    constructor(
        private readonly historicalReportingService: HistoricalReportingService,
    ) { }

    async execute(query: GetDailyMonthlyRevenueReportQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.historicalReportingService.getDailyMonthlyRevenueReport(
            query.filters,
            query.page,
            query.limit,
        );
    }
}

@QueryHandler(GetRefundReportQuery)
export class GetRefundReportQueryHandler
    implements IQueryHandler<GetRefundReportQuery> {
    constructor(
        private readonly historicalReportingService: HistoricalReportingService,
    ) { }

    async execute(query: GetRefundReportQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.historicalReportingService.getRefundReport(
            query.filters,
            query.page,
            query.limit,
        );
    }
}

@QueryHandler(GetPaymentMethodReportQuery)
export class GetPaymentMethodReportQueryHandler
    implements IQueryHandler<GetPaymentMethodReportQuery> {
    constructor(
        private readonly historicalReportingService: HistoricalReportingService,
    ) { }

    async execute(query: GetPaymentMethodReportQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.historicalReportingService.getPaymentMethodReport(
            query.filters,
            query.page,
            query.limit,
        );
    }
}

