import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';
import { IHistoricalReportingRepository } from 'src/domain/repositories/historical-reporting/historical-reporting.repository';
import { DailyMonthlyRevenueReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { RefundReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { PaymentMethodReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';

@Injectable()
export class HistoricalReportingRepositoryImpl
    implements IHistoricalReportingRepository {
    constructor(
        @InjectConnection()
        private readonly connection: Connection,
    ) { }

    private async dailyMonthlyRevenueReportFunction(
        startDate: string | undefined,
        endDate: string | undefined,
        groupBy: string = 'DAILY',
    ): Promise<any[]> {
        try {
            const result = await this.connection.query(
                `SELECT * FROM fn_report_revenue_history($1::date, $2::date, $3::text)`,
                [startDate || null, endDate || null, groupBy],
            );
            console.log(
                `✅ Executed fn_report_revenue_history for startDate: ${startDate}, endDate: ${endDate}, groupBy: ${groupBy}`,
            );
            return result;
        } catch (error) {
            console.error('Error calling fn_report_revenue_history:', error);
            throw new Error(`Failed to fetch revenue history report: ${error.message}`);
        }
    }

    private async refundReportFunction(
        startDate: string | undefined,
        endDate: string | undefined,
    ): Promise<any[]> {
        try {
            const result = await this.connection.query(
                `SELECT * FROM fn_report_refund_history($1::date, $2::date)`,
                [startDate || null, endDate || null],
            );
            console.log(
                `✅ Executed fn_report_refund_history for startDate: ${startDate}, endDate: ${endDate}`,
            );
            return result;
        } catch (error) {
            console.error('Error calling fn_report_refund_history:', error);
            throw new Error(`Failed to fetch refund history report: ${error.message}`);
        }
    }

    private async paymentMethodReportFunction(
        startDate: string | undefined,
        endDate: string | undefined,
    ): Promise<any[]> {
        try {
            const result = await this.connection.query(
                `SELECT * FROM fn_report_payment_method_usage($1::date, $2::date)`,
                [startDate || null, endDate || null],
            );
            console.log(
                `✅ Executed fn_report_payment_method_usage for startDate: ${startDate}, endDate: ${endDate}`,
            );
            return result;
        } catch (error) {
            console.error('Error calling fn_report_payment_method_usage:', error);
            throw new Error(
                `Failed to fetch payment method usage report: ${error.message}`,
            );
        }
    }


    async findDailyMonthlyRevenue(
        filters: DailyMonthlyRevenueReportDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { timeRange, eventIds, organizerIds, currency, paymentMethod, granularity } = filters;
        const startDate = timeRange?.start
            ? new Date(timeRange.start).toISOString().split('T')[0]
            : undefined;
        const endDate = timeRange?.end
            ? new Date(timeRange.end).toISOString().split('T')[0]
            : undefined;
        const groupByValue = granularity ? granularity.toUpperCase() : 'DAILY';

        let data = await this.dailyMonthlyRevenueReportFunction(startDate, endDate, groupByValue);

        data = data.filter((item) => {
            return (
                (!eventIds || eventIds.includes(item.event_name)) &&
                (!organizerIds || organizerIds.includes(item.organizer_name)) &&
                (!currency || item.currency_code === currency) &&
                (!paymentMethod || item.payment_method === paymentMethod)
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

    async findRefunds(
        filters: RefundReportDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { timeRange, eventIds, reasonCodes, currency, amountRange } = filters;
        const startDate = timeRange?.start
            ? new Date(timeRange.start).toISOString().split('T')[0]
            : undefined;
        const endDate = timeRange?.end
            ? new Date(timeRange.end).toISOString().split('T')[0]
            : undefined;

        let data = await this.refundReportFunction(startDate, endDate);

        data = data.filter((item) => {
            return (
                (!eventIds || eventIds.includes(item.event_name)) &&
                (!reasonCodes || reasonCodes.includes(item.reason_code)) &&
                (!currency || item.currency_code === currency) &&
                (!amountRange ||
                    (item.total_refund >= amountRange.min &&
                        item.total_refund <= amountRange.max))
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

    async findPaymentMethods(
        filters: PaymentMethodReportDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { timeRange, eventIds, paymentMethods, currency } = filters;
        const startDate = timeRange?.start
            ? new Date(timeRange.start).toISOString().split('T')[0]
            : undefined;
        const endDate = timeRange?.end
            ? new Date(timeRange.end).toISOString().split('T')[0]
            : undefined;

        let data = await this.paymentMethodReportFunction(startDate, endDate);

        data = data.filter((item) => {
            return (
                (!eventIds || eventIds.includes(item.event_name)) &&
                (!paymentMethods || paymentMethods.includes(item.payment_method)) &&
                (!currency || item.currency_code === currency)
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

}