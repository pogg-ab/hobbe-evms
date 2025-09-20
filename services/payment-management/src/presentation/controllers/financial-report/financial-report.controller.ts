import {
    Controller,
    Post,
    Body,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { Permissions } from 'src/presentation/decorators/permissions.decorator';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { CustomReportFilterDto } from 'src/presentation/dtos/financial-report/custom-report-filter.dto';
import { GetFeesPayoutReportQuery } from 'src/application/queries/financial-report/get-fees-payout-report.query';
import { GetNetRevenueReportQuery } from 'src/application/queries/financial-report/get-net-revenue-report.query';

@ApiTags('Financial Report')
@Controller('financial-report')
export class FinancialReportController {
    constructor(private readonly queryBus: QueryBus) { }

    @ApiOperation({
        description:
            'Get Fees & Payout Report: Breakdown of all fees (gateway + commission) and payouts with filters and pagination',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Fees & Payout Report retrieved successfully',
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
    @Post('standard/fees-payout')
    async getFeesPayoutReport(
        @Body() filters: CustomReportFilterDto,
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.queryBus.execute(
            new GetFeesPayoutReportQuery(filters, filters.page ?? 1, filters.limit ?? 10),
        );
    }

    @ApiOperation({
        description:
            'Get Net Revenue Report: Net revenue trends for profitability tracking with filters and pagination',
    })
    @HttpCode(200)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: 'Net Revenue Report retrieved successfully',
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
    @Post('report/net-revenue')
    async getNetRevenueReport(
        @Body() filters: CustomReportFilterDto,
    ): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return await this.queryBus.execute(
            new GetNetRevenueReportQuery(filters, filters.page ?? 1, filters.limit ?? 10),
        );
    }
}
