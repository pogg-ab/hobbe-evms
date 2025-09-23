import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { GetLiveRevenueDashboardQuery } from 'src/application/queries/reports/real-time-analytics/real-time-analytics.queries';
import { GetLiveTransactionFeedQuery } from 'src/application/queries/reports/real-time-analytics/real-time-analytics.queries';
import { LiveRevenueDashboardDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';
import { LiveTransactionFeedDto } from 'src/presentation/dtos/reports/real-time-analytics.dtos';

@ApiTags('Real-Time Analytics')
@Controller('real-time-analytics')
export class RealTimeAnalyticsController {
    constructor(private readonly queryBus: QueryBus) { }

    @ApiOperation({
        description:
            'Get Live Revenue Dashboard: Real-time revenue data segmented by event, organizer, payment method, and currency',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Live Revenue Dashboard retrieved successfully',
        type: Object,
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { type: 'object' } },
                total: { type: 'number', example: 100 },
            },
        },
    })
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Post('revenue-dashboard')
    async getLiveRevenueDashboard(@Body() filters: LiveRevenueDashboardDto): Promise<{
        data: any[];
        total: number;
    }> {
        return await this.queryBus.execute(new GetLiveRevenueDashboardQuery(filters));
    }

    @ApiOperation({
        description:
            'Get Live Transaction Feed: Real-time feed of transactions with filters and searchable details',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Live Transaction Feed retrieved successfully',
        type: Object,
        schema: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { type: 'object' } },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                totalPages: { type: 'number', example: 10 },
            },
        },
    })
    @UseGuards(UniversalAuthGuard, PermissionsGuard)
    @Post('transaction-feed')
    async getLiveTransactionFeed(@Body() filters: LiveTransactionFeedDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.queryBus.execute(
            new GetLiveTransactionFeedQuery(
                filters,
                filters.page ?? 1,
                filters.limit ?? 10,
            ),
        );
    }
}