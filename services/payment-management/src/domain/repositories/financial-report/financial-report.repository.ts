import { CustomReportFilterDto } from 'src/presentation/dtos/financial-report/custom-report-filter.dto';

export interface IFinancialReportRepository {
    findFeesPayout(
        filters: CustomReportFilterDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }>;

    findNetRevenue(
        filters: CustomReportFilterDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }>;
}