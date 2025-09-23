import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IHistoricalReportingRepository } from 'src/domain/repositories/historical-reporting/historical-reporting.repository';
import { HISTORICAL_REPORTING_REPOSITORY_TOKEN } from 'src/domain/repositories/historical-reporting/historical-reporting.repository.token';
import { DailyMonthlyRevenueReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { RefundReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { PaymentMethodReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';

@Injectable()
export class HistoricalReportingService {
    constructor(
        @Inject(HISTORICAL_REPORTING_REPOSITORY_TOKEN)
        private readonly historicalReportingRepository: IHistoricalReportingRepository,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async getDailyMonthlyRevenueReport(
        filters: DailyMonthlyRevenueReportDto,
        page: number,
        limit: number,
    ): Promise<any> {
        const result = await this.historicalReportingRepository.findDailyMonthlyRevenue(
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

    async getRefundReport(
        filters: RefundReportDto,
        page: number,
        limit: number,
    ): Promise<any> {
        const result = await this.historicalReportingRepository.findRefunds(
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

    async getPaymentMethodReport(
        filters: PaymentMethodReportDto,
        page: number,
        limit: number,
    ): Promise<any> {
        const result = await this.historicalReportingRepository.findPaymentMethods(
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