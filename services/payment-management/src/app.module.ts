import { Module } from '@nestjs/common';
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
  ],
  providers: [
    AppService,
    KafkaConsumerService,
    KafkaProducerService,
  ],
})
export class AppModule { }
