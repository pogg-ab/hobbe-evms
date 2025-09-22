import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { DashboardAnalyticsQuery } from 'src/application/queries/reports/dashboard-analytics/dashboard-analytics.query';
import { DashboardAnalyticsDto } from 'src/presentation/dtos/reports/dashboard-analytics.dto';
import { PermissionsGuard } from 'src/presentation/guards/permissions.guard';
import { UniversalAuthGuard } from 'src/presentation/guards/universal-auth.guard';

@Controller('dashboard-analytics')
export class DashboardAnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({
    description:
      'Dashboard Analytics: Fetch dashboard analytics data filtered by date range with pagination support',
  })
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Dashboard analytics data retrieved successfully',
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
  @ApiBody({ type: DashboardAnalyticsDto })
  @UseGuards(UniversalAuthGuard, PermissionsGuard)
  @Post('report')
  async dashboardAnalytics(
    @Body() filters: DashboardAnalyticsDto,
  ): Promise<any> {
    return await this.queryBus.execute(new DashboardAnalyticsQuery(filters));
  }
}
