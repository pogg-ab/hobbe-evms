import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. IMPORT
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';
import { PaymentsModule } from '../payments/payments.module';
import { StripeController } from 'src/presentation/controllers/payment-methods/stripe/stripe.controller';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
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
  controllers: [StripeController],
  providers: [StripeService, AuditLogInterceptor],
  exports: [StripeService],
})
export class StripeModule {}