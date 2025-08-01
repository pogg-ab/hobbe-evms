// payments.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AggregatedTransactionVolumeQuery } from 'src/application/queries/payments/aggregated-transaction-volume.query';
import { GetMonthlyAndTodayTransactionsQuery } from 'src/application/queries/payments/get-monthly-and-today-transactions.query';
import { TransactionsVolumeByDateRange } from 'src/application/queries/payments/transaction-volume-by-date-range.query';
import { AggregatedTransactionVolumeDto } from 'src/presentation/dtos/reports/aggregated-transaction-volume.dto';
import { TransactionsVolumeByDateRangeDto } from 'src/presentation/dtos/reports/trasaction-volume.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ description: 'Transactions Time-based Performance Summary' })
  @HttpCode(200)
  // @Get('transactions-summary')
  @Get('transactions-time-based-performance-summary')
  async getSummary() {
    return this.queryBus.execute(new GetMonthlyAndTodayTransactionsQuery());
  }

  // As an admin, I want to see the total volume of transactions on Hobbe platform over selectable time ranges.
  @ApiOperation({ description: 'Transactions Volume by Date Range' })
  @HttpCode(200)
  @ApiBody({ type: TransactionsVolumeByDateRangeDto })
  @Post('transactions-volume-by-date-range')
  async getSummaryByDateRange(
    @Body() daterange: TransactionsVolumeByDateRangeDto,
  ) {
    if (!daterange || !daterange.startDate || !daterange.endDate) {
      throw new HttpException(
        'Start date and end date are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (daterange.startDate > daterange.endDate) {
      throw new HttpException(
        'Start date cannot be after end date',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.queryBus.execute(new TransactionsVolumeByDateRange(daterange));
  }

  // get total transaction value aggregated by day, week, month, year
  @ApiOperation({ description: 'Total Transaction Value Aggregated' })
  @HttpCode(200)
  @ApiBody({ type: AggregatedTransactionVolumeDto })
  @Post('total-transaction-value-aggregated')
  async getTotalTransactionValueAggregated(
    @Body() aggregatedTransactionVolumeDto: AggregatedTransactionVolumeDto,
  ) {
    if (
      !aggregatedTransactionVolumeDto ||
      !aggregatedTransactionVolumeDto.startDate ||
      !aggregatedTransactionVolumeDto.endDate
    ) {
      throw new HttpException(
        'Start date and end date are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      aggregatedTransactionVolumeDto.startDate >
      aggregatedTransactionVolumeDto.endDate
    ) {
      throw new HttpException(
        'Start date cannot be after end date',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.queryBus.execute(
      new AggregatedTransactionVolumeQuery(aggregatedTransactionVolumeDto),
    );
  }
}
