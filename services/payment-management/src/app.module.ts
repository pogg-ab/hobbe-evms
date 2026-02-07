import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaConsumerService } from './infrastructure/kafka/kafka.consumer.service';
import { ConfigModule } from '@nestjs/config';
import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { CqrsModule } from '@nestjs/cqrs';
import { BankAccountsModule } from './modules/bank-accounts/bank-account.module';
import { WiseModule } from './modules/payment-methods/wise/wise.module';
import { ChapaModule } from './modules/payment-methods/chapa/chapa.module';
import { ChapaSDKService } from './application/services/payment-methods/chapa/chapa-sdk.service';
import { KafkaProducerService } from './infrastructure/kafka/kafka.producer.servicce';
import { StripeModule } from './modules/payment-methods/stripe/stripe.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AnalyticsModule } from './modules/reports/analytics.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { Tax } from './domain/entities/tax.entity';
import { TaxModule } from './modules/tax/tax.module';
import { CommissionFee } from './domain/entities/commission-fee.entity';
import { CommissionFeeModule } from './modules/commission-fee/commission-fee.module';
import { PaymentGatewayFee } from './domain/entities/payment-gateway-fee.entity';
import { PaymentGatewayFeeModule } from './modules/payment-gateway-fee/payment-gateway-fee.module';
import { DataSource } from 'typeorm';
import { AccountCode } from './domain/entities/account-code.entity';
import { runSeeders } from 'typeorm-extension';
import AccountCodeSeeder from './infrastructure/persistence/seeder/account-code.seeder';
import { FinancialAccountType } from './domain/entities/financial-account-type.entity';
import FinancialAccountTypeSeeder from './infrastructure/persistence/seeder/financial-account-type.seeder';
import CurrencySeeder from './infrastructure/persistence/seeder/currency.seeder';
import { Currency } from './domain/entities/currency.entity';
import { TransactionType } from './domain/entities/transaction-type.entity';
import TransactionTypeSeeder from './infrastructure/persistence/seeder/transaction-type.seeder';
import { FinancialReportModule } from './modules/financial-report/financial-report.module';
import { DashboardAnalyticsModule } from './modules/dashboard-analytics/dashboard-analytics.module';
import { RealTimeAnalyticsModule } from './modules/reports/real-time-analytics.module';
import { HistoricalReportingModule } from './modules/reports/historical-reporting.module';
import { PaymentsModule } from './modules/payment-methods/payments/payments.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AutomapperModule.forRoot([
      {
        name: 'default',
        strategyInitializer: classes(),
      },
    ]),
    DatabaseModule,
    CqrsModule,
    PaymentsModule,
    BankAccountsModule,
    WiseModule,
    ChapaModule,
    StripeModule,
    ReportsModule,
    AnalyticsModule,
    AuditLogModule,
    AuthModule,
    TaxModule,
    CommissionFeeModule,
    PaymentGatewayFeeModule,
    FinancialReportModule,
    DashboardAnalyticsModule,
    RealTimeAnalyticsModule,
    HistoricalReportingModule
  ],
  providers: [AppService, KafkaConsumerService, KafkaProducerService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) { }

  async onModuleInit() {
    const accountCodeRepository = this.dataSource.getRepository(AccountCode);
    const financialAccountTypeRepository =
      this.dataSource.getRepository(FinancialAccountType);
    const currencyRepository = this.dataSource.getRepository(Currency);
    const transactionTypeRepository =
      this.dataSource.getRepository(TransactionType);

    const accountCodeCount = await accountCodeRepository.count();
    const financialAccountTypeCount =
      await financialAccountTypeRepository.count();
    const currencyCount = await currencyRepository.count();
    const transactionTypeCount = await transactionTypeRepository.count();

    if (accountCodeCount === 0) {
      await runSeeders(this.dataSource, {
        seeds: [AccountCodeSeeder],
      });
    }

    if (financialAccountTypeCount === 0) {
      await runSeeders(this.dataSource, {
        seeds: [FinancialAccountTypeSeeder],
      });
    }

    if (currencyCount === 0) {
      await runSeeders(this.dataSource, {
        seeds: [CurrencySeeder],
      });
    }

    if (transactionTypeCount === 0) {
      await runSeeders(this.dataSource, {
        seeds: [TransactionTypeSeeder],
      });
    }
  }
}
