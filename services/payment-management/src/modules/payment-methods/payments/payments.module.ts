import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePaymentCommand } from 'src/application/commands/payments/create-payments.command';
import { GetAmountsOwedToOrganizersQueryHandler } from 'src/application/handlers/payments/get-amounts-owed-to-organizers.handler';
import { GetPaymentsQueryHandler } from 'src/application/handlers/payments/get-payments.handler';
import { PaymentsService } from 'src/application/services/payments/payments.service';
import { FinancialAccount } from 'src/domain/entities/financial-account.entity';
import { Payments } from 'src/domain/entities/payments.entity';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer.servicce';
import { PaymentRepositoryImpl } from 'src/infrastructure/persistence/repositories/payment.repository.impl';
import { PaymentsController } from 'src/presentation/controllers/payments/payments.controller';

@Module({
     imports: [
         TypeOrmModule.forFeature([Payments,FinancialAccount]),
         CqrsModule,
     ],
     controllers: [PaymentsController],
     providers: [
        PaymentsService,
        GetPaymentsQueryHandler,
        GetAmountsOwedToOrganizersQueryHandler,
        KafkaProducerService,
        {
             provide: CREATE_PAYMENT_TOKEN,
             useClass: PaymentRepositoryImpl,
           },
         ],
         exports: [CREATE_PAYMENT_TOKEN], 
})
export class PaymentsModule {}
