import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- 1. IMPORT
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';
import { PaymentsModule } from '../payments/payments.module';
import { StripeController } from 'src/presentation/controllers/payment-methods/stripe/stripe.controller';


@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    PaymentsModule,
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
  providers: [StripeService, ],
  exports: [StripeService],
})
export class StripeModule {}