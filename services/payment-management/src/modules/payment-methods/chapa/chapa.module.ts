import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { ChapaController } from 'src/presentation/controllers/payment-methods/chapa/chapa.controller';
import { PaymentsModule } from '../payments/payments.module';
import { CREATE_BANK_ACCOUNT_TOKEN } from 'src/domain/repositories/bank-accouts/bank-accout.repository.token';
import { PaymentRepositoryImpl } from 'src/infrastructure/persistence/repositories/payment.repository.impl';

@Module({
  imports: [ScheduleModule.forRoot(), PaymentsModule],
  controllers: [ChapaController],
  providers: [
    ChapaSDKService,
  ],

  exports: [ChapaSDKService],
})
export class ChapaModule {}
