import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IFinancialReportRepository } from 'src/domain/repositories/financial-report/financial-report.repository';
import { FINANCIAL_REPORT_REPOSITORY_TOKEN } from 'src/domain/repositories/financial-report/financial-report.repository.token';
import { NetRevenueReportDto } from 'src/presentation/dtos/reports/financial-report/net-revenue-report.dto';
import { FeePayoutReportDto } from 'src/presentation/dtos/reports/financial-report/fee-payout-report.dto';

@Injectable()
export class FinancialReportService {
  constructor(
    @Inject(FINANCIAL_REPORT_REPOSITORY_TOKEN)
    private readonly financialReportRepository: IFinancialReportRepository,
    @InjectMapper()
    private readonly mapper: Mapper,
  ) {}

  async getFeesPayoutReport(
    filters: FeePayoutReportDto,
    page: number,
    limit: number,
  ): Promise<any> {
    const result = await this.financialReportRepository.findFeesPayout(
      filters,
      page,
      limit,
    );
    const data = result.data;
    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.data ? Math.ceil(result.total / result.limit) : 0,
    };
  }

  async getNetRevenueReport(
    filters: NetRevenueReportDto,
    page: number,
    limit: number,
  ): Promise<any> {
    const result = await this.financialReportRepository.findNetRevenue(
      filters,
      page,
      limit,
    );
    const data = result.data;
    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.data ? Math.ceil(result.total / result.limit) : 0,
    };
  }
}
