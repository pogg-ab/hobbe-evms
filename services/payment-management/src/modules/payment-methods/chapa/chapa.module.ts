import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. IMPORT
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { ChapaController } from 'src/presentation/controllers/payment-methods/chapa/chapa.controller';
import { PaymentsModule } from '../payments/payments.module';
import { KafkaPaymentRpcConsumerService } from 'src/infrastructure/kafka/kafka-payment-rpc-consumer.service';
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { PayoutsModule } from '../payments/payouts.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PayoutsModule,
    PaymentsModule,
    AuditLogModule,
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER', // Must match the @Inject() token
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-management-producer',
            brokers: [process.env.KAFKA_BROKER],
          },
        },
      },
    ]),
  ],
  controllers: [ChapaController],
  providers: [
    ChapaSDKService,
    StripeService,
    KafkaPaymentRpcConsumerService,
    AuditLogInterceptor,
  ],
  exports: [ChapaSDKService],
})
export class ChapaModule {}