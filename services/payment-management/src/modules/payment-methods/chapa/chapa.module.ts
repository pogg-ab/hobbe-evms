// src/modules/payment-methods/chapa/chapa.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt'; // <-- PROVIDES JwtService
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- PROVIDES KAFKA_PRODUCER
import { ChapaSDKService } from 'src/application/services/payment-methods/chapa/chapa-sdk.service';
import { ChapaController } from 'src/presentation/controllers/payment-methods/chapa/chapa.controller';
import { PaymentsModule } from '../payments/payments.module';
import { KafkaPaymentRpcConsumerService } from 'src/infrastructure/kafka/kafka-payment-rpc-consumer.service';
import { StripeService } from 'src/application/services/payment-methods/stripe/stripe.service';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { PayoutsModule } from '../payments/payouts.module';
import { KafkaRefundRpcService } from 'src/infrastructure/kafka/kafka.refund.rpc.service';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refund } from 'src/domain/entities/refund.entity';
import { RefundRequest } from 'src/domain/entities/refund-request.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Refund, RefundRequest]),
    PayoutsModule,
    PaymentsModule,
    AuditLogModule, 
    JwtModule.register({}), 
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-management-producer', 
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
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
    KafkaRefundRpcService,
    KafkaProducerService,
  ],
  exports: [ChapaSDKService],
})
export class ChapaModule {}