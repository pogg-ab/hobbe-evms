import { FeePayoutReportDto } from 'src/presentation/dtos/reports/financial-report/fee-payout-report.dto';
import { NetRevenueReportDto } from 'src/presentation/dtos/reports/financial-report/net-revenue-report.dto';

export interface IFinancialReportRepository {
  findFeesPayout(
    filters: FeePayoutReportDto,
    page: number,
    limit: number,
  ): Promise<{
    data: any[] | null;
    total: number;
    page: number;
    limit: number;
  }>;

  findNetRevenue(
    filters: NetRevenueReportDto,
    page: number,
    limit: number,
  ): Promise<{
    data: any[] | null;
    total: number;
    page: number;
    limit: number;
  }>;
}
