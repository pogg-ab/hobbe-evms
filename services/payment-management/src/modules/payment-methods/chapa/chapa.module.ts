import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { ChapaController } from 'src/presentation/controllers/payment-methods/chapa/chapa.controller';
import { PaymentsModule } from '../payments/payments.module';

import { KafkaPaymentRpcConsumerService } from 'src/infrastructure/kafka/kafka-payment-rpc-consumer.service';

@Module({
  imports: [ScheduleModule.forRoot(), PaymentsModule],
  controllers: [ChapaController],
  providers: [
    ChapaSDKService,
    KafkaPaymentRpcConsumerService,
  ],

  exports: [ChapaSDKService],
})
export class ChapaModule {}
