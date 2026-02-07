import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiAcceptedResponse, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CollectDownloadCommand } from 'src/application/commands/reports/collect-download.command';
import { AnalyticsSummary } from 'src/application/queries/reports/app-users/analytics-summary.query';
import { AppDownloadsByCountryQuery } from 'src/application/queries/reports/app-users/downloads-by-country.query';
import { AppDownloadsByDateQuery } from 'src/application/queries/reports/app-users/downloads-by-date.query';
import { AppDownloadsByPlatformQuery } from 'src/application/queries/reports/app-users/downloads-by-platform.query';
import { CreateDownloadDto } from 'src/presentation/dtos/reports/create-download.dto';
import { GetDownloadsByDateRangeDto } from 'src/presentation/dtos/reports/get-downloads-by-daterange.dto';

@Controller('downloads')
export class AnalyticsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ description: 'Collect Download Data' })
  @ApiBody({ type: CreateDownloadDto })
  @ApiAcceptedResponse({
    description: 'Download data collected successfully',
  })
  @HttpCode(202)
  @Post('store')
  async collectData(@Body() dto: CreateDownloadDto) {
    return await this.commandBus.execute(new CollectDownloadCommand(dto));
  }

  @ApiOperation({ description: 'Get Summary of Download Data' })
  @ApiAcceptedResponse({
    description: 'Summary of download data',
  })
  @HttpCode(200)
  @Get('summary')
  async getAnalyticsSummary() {
    return await this.queryBus.execute(new AnalyticsSummary());
  }

  @ApiOperation({ description: 'Get Download Data by Country' })
  @ApiAcceptedResponse({
    description: 'Download data by country',
  })
  @ApiOperation({ description: 'Get Download Data by Date' })
  @ApiAcceptedResponse({
    description: 'Download data by date',
  })
  @HttpCode(200)
  @ApiBody({ type: GetDownloadsByDateRangeDto })
  @Post('daterange')
  async getDownloadsByDate(@Body() dto: GetDownloadsByDateRangeDto) {
    // Use the query bus to execute the query
    if (!dto.startDate || !dto.endDate) {
      throw new Error('Start date and end date are required');
    }
    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new Error('Start date cannot be after end date');
    }

    return await this.queryBus.execute(new AppDownloadsByDateQuery(dto));
  }

  @HttpCode(200)
  @Get('country/:country')
  async getDownloadsByCountry(@Param('country') country: string) {
    return await this.queryBus.execute(new AppDownloadsByCountryQuery(country));
  }

  @ApiOperation({ description: 'Get Download Data by Platform' })
  @ApiAcceptedResponse({
    description: 'Download data by platform',
  })
  @HttpCode(200)
  @Get('platform/:platform')
  async getDownloadsByPlatform(
    @Param('platform') platform: 'android' | 'ios' | 'web' | 'desktop',
  ) {
    return await this.queryBus.execute(
      new AppDownloadsByPlatformQuery(platform),
    );
  }
}
