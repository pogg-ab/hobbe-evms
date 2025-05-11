// stripe.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';
import { PaymentsModule } from '../payments/payments.module';
import { StripeController } from 'src/presentation/controllers/payment-methods/stripe/stripe.controller';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(), PaymentsModule
  ],
  controllers: [StripeController], // Add your controllers here if needed
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
