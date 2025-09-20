import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { CustomReportFilterDto } from 'src/presentation/dtos/financial-report/custom-report-filter.dto';
import { IFinancialReportRepository } from 'src/domain/repositories/financial-report/financial-report.repository';

@Injectable()
export class FinancialReportRepositoryImpl implements IFinancialReportRepository {
    constructor(
        @InjectConnection()
        private readonly connection: Connection,
    ) { }

    private async feesPayoutReportFunction(
        startDate: string | undefined,
        endDate: string | undefined,
    ): Promise<any[]> {
        try {
            const result = await this.connection.query(
                `SELECT * FROM fn_financial_fees_payout_report($1::date, $2::date)`,
                [startDate || null, endDate || null],
            );
            console.log(`✅ Executed fn_financial_fees_payout_report for startDate: ${startDate}, endDate: ${endDate}`);
            return result;
        } catch (error) {
            console.error('Error calling fn_financial_fees_payout_report:', error);
            throw new Error(`Failed to fetch fees and payout report: ${error.message}`);
        }
    }

    private async netRevenueReportFunction(
        startDate: string | undefined,
        endDate: string | undefined,
        groupBy: string = 'day',
    ): Promise<any[]> {
        try {
            const result = await this.connection.query(
                `SELECT * FROM fn_net_revenue_report($1::date, $2::date, $3::text)`,
                [startDate || null, endDate || null, groupBy],
            );
            console.log(`✅ Executed fn_net_revenue_report for startDate: ${startDate}, endDate: ${endDate}, groupBy: ${groupBy}`);
            return result;
        } catch (error) {
            console.error('Error calling fn_net_revenue_report:', error);
            throw new Error(`Failed to fetch net revenue report: ${error.message}`);
        }
    }

    async findFeesPayout(
        filters: CustomReportFilterDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { timeRange, eventIds, organizerIds, currency, paymentMethod, gatewayFeeRange, commissionFeeRange } = filters;
        const startDate = timeRange?.start ? new Date(timeRange.start).toISOString().split('T')[0] : undefined;
        const endDate = timeRange?.end ? new Date(timeRange.end).toISOString().split('T')[0] : undefined;

        let data = await this.feesPayoutReportFunction(startDate, endDate);

        data = data.filter(item => {
            return (
                (!eventIds || eventIds.includes(item.event_name)) &&
                (!organizerIds || organizerIds.includes(item.organizer_name)) &&
                (!currency || item.currency === currency) &&
                (!paymentMethod || item.payment_method === paymentMethod) &&
                (!gatewayFeeRange || (item.gateway_fee >= gatewayFeeRange.min && item.gateway_fee <= gatewayFeeRange.max)) &&
                (!commissionFeeRange || (item.commission_fee >= commissionFeeRange.min && item.commission_fee <= commissionFeeRange.max))
            );
        });

        const total = data.length;
        const startIndex = (page - 1) * limit;
        const paginatedData = data.slice(startIndex, startIndex + limit);

        return {
            data: paginatedData.length ? paginatedData : null,
            total,
            page,
            limit,
        };
    }

    async findNetRevenue(
        filters: CustomReportFilterDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { timeRange, currency, groupBy } = filters;
        const startDate = timeRange?.start ? new Date(timeRange.start).toISOString().split('T')[0] : undefined;
        const endDate = timeRange?.end ? new Date(timeRange.end).toISOString().split('T')[0] : undefined;
        const groupByValue = groupBy || 'day';

        let data = await this.netRevenueReportFunction(startDate, endDate, groupByValue);

        if (currency) {
            data = data.filter(item => item.currency === currency);
        }

        const total = data.length;
        const startIndex = (page - 1) * limit;
        const paginatedData = data.slice(startIndex, startIndex + limit);

        return {
            data: paginatedData.length ? paginatedData : null,
            total,
            page,
            limit,
        };
    }
}