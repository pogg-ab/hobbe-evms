import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialReportService } from 'src/application/services/report/financial-report/financial-report.service';
import { GetNetRevenueReportQuery } from 'src/application/queries/reports/financial-report/get-net-revenue-report.query';

@QueryHandler(GetNetRevenueReportQuery)
export class GetNetRevenueReportQueryHandler
  implements IQueryHandler<GetNetRevenueReportQuery>
{
  constructor(
    private readonly financialReportService: FinancialReportService,
  ) {}

  async execute(query: GetNetRevenueReportQuery): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.financialReportService.getNetRevenueReport(
      query.filters,
      query.page,
      query.limit,
    );
  }
}
