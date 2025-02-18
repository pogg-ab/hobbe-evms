import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreatePaymentCommand } from 'src/application/commands/payments/create-payments.command';
import { PaymentsService } from 'src/application/services/payments/payments.service';
import { Payments } from 'src/domain/entities/payments.entity';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { PaymentRepositoryImpl } from 'src/infrastructure/persistence/repositories/payment.repository.impl';

@Module({
     imports: [
         TypeOrmModule.forFeature([Payments]),
     ],
     controllers: [],
     providers: [
        PaymentsService,
        {
             provide: CREATE_PAYMENT_TOKEN,
             useClass: PaymentRepositoryImpl,
           },
         ],
         exports: [CREATE_PAYMENT_TOKEN], 
})
export class PaymentsModule {}
