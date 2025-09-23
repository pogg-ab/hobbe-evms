import { Injectable } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { IRealTimeAnalyticsRepository } from 'src/domain/repositories/real-time-analytics/real-time-analytics.repository';
import { LiveRevenueDashboardDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';
import { LiveTransactionFeedDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';
import { Transaction } from 'src/domain/entities/transaction.entity';

@Injectable()
export class RealTimeAnalyticsRepositoryImpl
    implements IRealTimeAnalyticsRepository {
    constructor(
        @InjectConnection()
        private readonly connection: Connection,
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) { }

    private async liveRevenueDashboardFunction(
        startDate: string | undefined,
        endDate: string | undefined,
    ): Promise<any[]> {
        try {
            const result = await this.connection.query(
                `SELECT * FROM fn_report_live_revenue_dashboard($1::date, $2::date)`,
                [startDate || null, endDate || null],
            );
            console.log(
                `✅ Executed fn_report_live_revenue_dashboard for startDate: ${startDate}, endDate: ${endDate}`,
            );
            return result;
        } catch (error) {
            console.error('Error calling fn_report_live_revenue_dashboard:', error);
            throw new Error(
                `Failed to fetch live revenue dashboard: ${error.message}`,
            );
        }
    }

    async findLiveRevenue(
        filters: LiveRevenueDashboardDto,
    ): Promise<{
        data: any[] | null;
        total: number;
    }> {
        const { timeRange, eventIds, organizerIds, currency, paymentMethod } = filters;
        const startDate = timeRange?.start
            ? new Date(timeRange.start).toISOString().split('T')[0]
            : undefined;
        const endDate = timeRange?.end
            ? new Date(timeRange.end).toISOString().split('T')[0]
            : undefined;

        let data = await this.liveRevenueDashboardFunction(startDate, endDate);

        data = data.filter((item) => {
            return (
                (!eventIds || eventIds.includes(item.event_name)) &&
                (!organizerIds || organizerIds.includes(item.organizer_name)) &&
                (!currency || item.currency_code === currency) &&
                (!paymentMethod || item.payment_method === paymentMethod)
            );
        });

        const total = data.length;

        return {
            data: data.length ? data : null,
            total,
        };
    }

    async findLiveTransactions(
        filters: LiveTransactionFeedDto,
        page: number,
        limit: number,
    ): Promise<{
        data: any[] | null;
        total: number;
        page: number;
        limit: number;
    }> {
        const { timeRange, eventIds, userIds, searchQuery, currency, paymentMethod } = filters;
        const startDate = timeRange?.start ? new Date(timeRange.start) : undefined;
        const endDate = timeRange?.end ? new Date(timeRange.end) : undefined;

        const queryBuilder = this.transactionRepository
            .createQueryBuilder('ft')
            .innerJoinAndSelect('ft.payment', 'pm')
            .select([
                'ft.transaction_id AS transaction_id',
                'ft.transaction_date AS transaction_date',
                'pm.event_id AS event_name',
                'pm.payment_method AS payment_method',
                'ft.currency_id AS currency_code',
                'ft.amount AS amount',
            ])
            .where('ft.transaction_type = :transactionType', {
                transactionType: 'CUSTOMER_TICKET_PURCHASE',
            })
            .andWhere('ft.__reversed_by IS NULL')
            .andWhere('ft.__reverses IS NULL')
            .andWhere('ft.reversed_by IS NULL')
            .andWhere('ft.reverses IS NULL');

        if (startDate && endDate) {
            queryBuilder.andWhere('ft.transaction_date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }

        let data = await queryBuilder.getRawMany();

        data = data.filter((item) => {
            const matchesSearchQuery = searchQuery
                ? item.event_name?.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            return (
                matchesSearchQuery &&
                (!eventIds || eventIds.includes(item.event_name)) &&
                (!userIds || userIds.includes(item.user_id)) &&
                (!currency || item.currency_code === currency) &&
                (!paymentMethod || item.payment_method === paymentMethod)
            );
        });

        const total = data.length;
        const startIndex = (page - 1) * limit;
        const paginatedData = data.slice(startIndex, startIndex + limit);

        console.log(
            `✅ Executed live transaction feed query for startDate: ${startDate?.toISOString()}, endDate: ${endDate?.toISOString()}`,
        );

        return {
            data: paginatedData.length ? paginatedData : null,
            total,
            page,
            limit,
        };
    }
}