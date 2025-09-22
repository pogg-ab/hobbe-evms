import { NetRevenueReportDto } from 'src/presentation/dtos/reports/financial-report/net-revenue-report.dto';

export class GetNetRevenueReportQuery {
  constructor(
    public readonly filters: NetRevenueReportDto,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}
