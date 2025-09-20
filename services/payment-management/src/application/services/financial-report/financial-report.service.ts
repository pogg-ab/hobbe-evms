import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { CustomReportFilterDto } from 'src/presentation/dtos/financial-report/custom-report-filter.dto';
import { IFinancialReportRepository } from 'src/domain/repositories/financial-report/financial-report.repository';
import { FINANCIAL_REPORT_REPOSITORY_TOKEN } from 'src/domain/repositories/financial-report/financial-report.repository.token';

@Injectable()
export class FinancialReportService {
    constructor(
        @Inject(FINANCIAL_REPORT_REPOSITORY_TOKEN)
        private readonly financialReportRepository: IFinancialReportRepository,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async getFeesPayoutReport(
        filters: CustomReportFilterDto,
        page: number,
        limit: number,
    ): Promise<any> {
        const result = await this.financialReportRepository.findFeesPayout(filters, page, limit);
        const data = result.data
        return {
            data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.data ? Math.ceil(result.total / result.limit) : 0,
        };
    }

    async getNetRevenueReport(
        filters: CustomReportFilterDto,
        page: number,
        limit: number,
    ): Promise<any> {
        const result = await this.financialReportRepository.findNetRevenue(filters, page, limit);
        const data = result.data
        return {
            data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.data ? Math.ceil(result.total / result.limit) : 0,
        };
    }
}