import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FinancialReportService } from 'src/application/services/report/financial-report/financial-report.service';
import { GetFeesPayoutReportQuery } from 'src/application/queries/reports/financial-report/get-fees-payout-report.query';

@QueryHandler(GetFeesPayoutReportQuery)
export class GetFeesPayoutReportQueryHandler
  implements IQueryHandler<GetFeesPayoutReportQuery>
{
  constructor(
    private readonly financialReportService: FinancialReportService,
  ) {}

  async execute(query: GetFeesPayoutReportQuery): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.financialReportService.getFeesPayoutReport(
      query.filters,
      query.page,
      query.limit,
    );
  }
}
