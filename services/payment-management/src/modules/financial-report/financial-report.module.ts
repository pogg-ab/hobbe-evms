import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FinancialReportController } from 'src/presentation/controllers/report/financial-report/financial-report.controller';
import { FinancialReportService } from 'src/application/services/report/financial-report/financial-report.service';
import { FinancialReportRepositoryImpl } from 'src/infrastructure/persistence/repositories/financial-report.repository.impl';
import { GetFeesPayoutReportQueryHandler } from 'src/application/handlers/reports/financial-report/get-fees-payout-report.query.handler';
import { GetNetRevenueReportQueryHandler } from 'src/application/handlers/reports/financial-report/get-net-revenue-report.query.handler';
import { FINANCIAL_REPORT_REPOSITORY_TOKEN } from 'src/domain/repositories/financial-report/financial-report.repository.token';

@Module({
  imports: [CqrsModule],
  controllers: [FinancialReportController],
  providers: [
    FinancialReportService,
    {
      provide: FINANCIAL_REPORT_REPOSITORY_TOKEN,
      useClass: FinancialReportRepositoryImpl,
    },
    GetFeesPayoutReportQueryHandler,
    GetNetRevenueReportQueryHandler,
  ],
})
export class FinancialReportModule {}
