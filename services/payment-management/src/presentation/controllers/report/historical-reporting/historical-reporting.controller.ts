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
import { GetDailyMonthlyRevenueReportQuery } from 'src/application/queries/reports/historical-reporting/historical-reporting.queries';
import { GetRefundReportQuery } from 'src/application/queries/reports/historical-reporting/historical-reporting.queries';
import { GetPaymentMethodReportQuery } from 'src/application/queries/reports/historical-reporting/historical-reporting.queries';
import { DailyMonthlyRevenueReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { RefundReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';
import { PaymentMethodReportDto } from 'src/presentation/dtos/reports/historical-reporting.dtos';

@ApiTags('Historical Reporting')
@Controller('historical-reporting')
export class HistoricalReportingController {
    constructor(private readonly queryBus: QueryBus) { }

    @ApiOperation({
        description:
            'Get Daily/Monthly Revenue Report: Historical revenue data by event, organizer, or payment type',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Daily/Monthly Revenue Report retrieved successfully',
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
    @Post('daily-monthly-revenue')
    async getDailyMonthlyRevenueReport(@Body() filters: DailyMonthlyRevenueReportDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.queryBus.execute(
            new GetDailyMonthlyRevenueReportQuery(
                filters,
                filters.page ?? 1,
                filters.limit ?? 10,
            ),
        );
    }

    @ApiOperation({
        description: 'Get Refund Report: Historical refund volume and reasons with filters',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Refund Report retrieved successfully',
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
    @Post('refund')
    async getRefundReport(@Body() filters: RefundReportDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.queryBus.execute(
            new GetRefundReportQuery(
                filters,
                filters.page ?? 1,
                filters.limit ?? 10,
            ),
        );
    }

    @ApiOperation({
        description: 'Get Payment Method Report: Historical payment method usage breakdown',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Payment Method Report retrieved successfully',
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
    @Post('payment-method')
    async getPaymentMethodReport(@Body() filters: PaymentMethodReportDto): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.queryBus.execute(
            new GetPaymentMethodReportQuery(
                filters,
                filters.page ?? 1,
                filters.limit ?? 10,
            ),
        );
    }
}