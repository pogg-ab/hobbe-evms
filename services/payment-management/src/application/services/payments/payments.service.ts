import { Inject, Injectable } from '@nestjs/common';
import { IPaymentsRepository } from 'src/domain/repositories/payments/payments.repository';
import { CREATE_PAYMENT_TOKEN } from 'src/domain/repositories/payments/payments.repository.token';
import { CreateChapaPayDto } from 'src/presentation/dtos/chapa/create-chapa-pay.dto';
import { CreatePaymentDto } from 'src/presentation/dtos/payments/create-payments.dto';

@Injectable()
export class PaymentsService {
 constructor(
    @Inject(CREATE_PAYMENT_TOKEN)
    private readonly paymentRepository:IPaymentsRepository
 ){}
    async create(createPaymentDto:CreatePaymentDto){
        return this.paymentRepository.create(createPaymentDto);
    }
}
