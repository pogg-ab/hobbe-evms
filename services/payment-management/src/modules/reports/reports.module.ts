import { AutomapperModule } from '@automapper/nestjs';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetMonthlyAndTodayTransactionsHandler } from 'src/application/handlers/payments/get-monthly-and-today-transactions.handler';
import { GetMonthlyAndTodayTransactionsQuery } from 'src/application/queries/payments/get-monthly-and-today-transactions.query';
import { PaymentsService } from 'src/application/services/payments/payments.service';
import { Payments } from 'src/domain/entities/payments.entity';
import { ReportsController } from 'src/presentation/controllers/report/summary.controller';
import { PaymentsModule } from '../payment-methods/payments/payments.module';

@Module({
  imports: [
    PaymentsModule,
    CqrsModule,
  ],
  controllers: [ReportsController],
  providers: [
    PaymentsService,
    GetMonthlyAndTodayTransactionsHandler,
    GetMonthlyAndTodayTransactionsQuery,
  ],
})
export class ReportsModule {}
