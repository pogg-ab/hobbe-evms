import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetDailyMonthlyRevenueReportQueryHandler } from 'src/application/handlers/reports/historical-reporting/historical-reporting.query.handlers';
import { GetRefundReportQueryHandler } from 'src/application/handlers/reports/historical-reporting/historical-reporting.query.handlers';
import { GetPaymentMethodReportQueryHandler } from 'src/application/handlers/reports/historical-reporting/historical-reporting.query.handlers';
import { HistoricalReportingService } from 'src/application/services/report/historical-reporting/historical-reporting.service';
import { Transaction } from 'src/domain/entities/transaction.entity';
import { HISTORICAL_REPORTING_REPOSITORY_TOKEN } from 'src/domain/repositories/historical-reporting/historical-reporting.repository.token';
import { HistoricalReportingRepositoryImpl } from 'src/infrastructure/persistence/repositories/historical-reporting.repository.impl';
import { HistoricalReportingController } from 'src/presentation/controllers/report/historical-reporting/historical-reporting.controller';

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Transaction])],
    controllers: [HistoricalReportingController],
    providers: [
        HistoricalReportingService,
        GetDailyMonthlyRevenueReportQueryHandler,
        GetRefundReportQueryHandler,
        GetPaymentMethodReportQueryHandler,
        {
            provide: HISTORICAL_REPORTING_REPOSITORY_TOKEN,
            useClass: HistoricalReportingRepositoryImpl,
        },
    ],
})
export class HistoricalReportingModule { }