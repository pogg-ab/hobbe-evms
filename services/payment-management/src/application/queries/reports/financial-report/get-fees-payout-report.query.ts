import { FeePayoutReportDto } from 'src/presentation/dtos/reports/financial-report/fee-payout-report.dto';

export class GetFeesPayoutReportQuery {
  constructor(
    public readonly filters: FeePayoutReportDto,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
