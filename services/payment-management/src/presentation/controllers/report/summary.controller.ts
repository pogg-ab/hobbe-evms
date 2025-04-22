// payments.controller.ts
import { Controller, Get, HttpCode } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation } from '@nestjs/swagger';
import { GetMonthlyAndTodayTransactionsQuery } from 'src/application/queries/payments/get-monthly-and-today-transactions.query';

@Controller('reports')
export class ReportsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ description: 'Transactions Volume' })
  @HttpCode(200)
  @Get('transactions-summary')
  async getSummary() {
    return this.queryBus.execute(new GetMonthlyAndTodayTransactionsQuery());
  }
}
