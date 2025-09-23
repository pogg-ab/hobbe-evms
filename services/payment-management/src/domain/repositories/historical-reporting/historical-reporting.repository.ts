import { DailyMonthlyRevenueReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { RefundReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { PaymentMethodReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';

export interface IHistoricalReportingRepository {
    findDailyMonthlyRevenue(
        filters: DailyMonthlyRevenueReportDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }>;

    findRefunds(
        filters: RefundReportDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }>;

    findPaymentMethods(
        filters: PaymentMethodReportDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }>;

}