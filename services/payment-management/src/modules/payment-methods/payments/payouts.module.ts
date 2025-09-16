import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payouts } from 'src/domain/entities/payouts.entity';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { CREATE_PAYOUT_TOKEN } from 'src/domain/repositories/payments/payouts.repository.token';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { PayoutRepositoryImpl } from 'src/infrastructure/persistence/repositories/payout.repository.impl';

@Module({
     imports: [
         TypeOrmModule.forFeature([Payouts]),
     ],
     controllers: [],
     providers: [
        // PayoutsService,
        KafkaProducerService,
        {
             provide: CREATE_PAYOUT_TOKEN,
             useClass: PayoutRepositoryImpl,
           },
         ],
         exports: [CREATE_PAYOUT_TOKEN], 
})
export class PayoutsModule {}
