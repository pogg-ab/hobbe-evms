import { Inject, Injectable } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { IRealTimeAnalyticsRepository } from 'src/domain/repositories/real-time-analytics/real-time-analytics.repository';
import { REAL_TIME_ANALYTICS_REPOSITORY_TOKEN } from 'src/domain/repositories/real-time-analytics/real-time-analytics.repository.token';
import { LiveRevenueDashboardDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';
import { LiveTransactionFeedDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';

@Injectable()
export class RealTimeAnalyticsService {
    constructor(
        @Inject(REAL_TIME_ANALYTICS_REPOSITORY_TOKEN)
        private readonly realTimeAnalyticsRepository: IRealTimeAnalyticsRepository,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async getLiveRevenueDashboard(
        filters: LiveRevenueDashboardDto,
    ): Promise<any> {
        const result = await this.realTimeAnalyticsRepository.findLiveRevenue(
            filters,
        );
        const data = result.data;
        return {
            data,
            total: result.total,
        };
    }

    async getLiveTransactionFeed(
        filters: LiveTransactionFeedDto,
        page: number,
        limit: number,
    ): Promise<any> {
        const result = await this.realTimeAnalyticsRepository.findLiveTransactions(
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