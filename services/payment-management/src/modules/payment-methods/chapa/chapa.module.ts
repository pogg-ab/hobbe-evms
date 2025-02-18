import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { ChapaController } from 'src/presentation/controllers/payment-methods/chapa/chapa.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [ScheduleModule.forRoot(), PaymentsModule],
  controllers: [ChapaController],
  providers: [ChapaSDKService],
})
export class ChapaModule {}
