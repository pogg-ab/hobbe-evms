import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';
import { IPaymentGatewayFeeRepository } from 'src/domain/repositories/payment-gateway-fee/payment-gateway-fee.repository';
import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentGatewayFeeRepositoryImpl implements IPaymentGatewayFeeRepository {
    constructor(
        @InjectRepository(PaymentGatewayFee)
        private readonly paymentGatewayFeeRepository: Repository<PaymentGatewayFee>,
    ) { }

    async create(paymentGatewayFee: PaymentGatewayFee, userId: string): Promise<PaymentGatewayFee> {
        paymentGatewayFee.payment_gateway_fee_id = new PaymentGatewayFeeIdValueObject(uuidv4());
        paymentGatewayFee.created_by = userId;
        paymentGatewayFee.created_at = new Date();
        return await this.paymentGatewayFeeRepository.save(paymentGatewayFee);
    }

    async findOne(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject): Promise<PaymentGatewayFee | null> {
        return await this.paymentGatewayFeeRepository.findOne({ where: { payment_gateway_fee_id: paymentGatewayFeeId.toString() } });
    }

    async findAll(page: number, limit: number): Promise<{ paymentGatewayFees: PaymentGatewayFee[] | null; total: number; page: number; limit: number }> {
        const [paymentGatewayFees, total] = await this.paymentGatewayFeeRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { paymentGatewayFees: paymentGatewayFees.length ? paymentGatewayFees : null, total, page, limit };
    }

    async update(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject, paymentGatewayFee: Partial<PaymentGatewayFee>, userId: string): Promise<PaymentGatewayFee> {
        const existingPaymentGatewayFee = await this.findOne(paymentGatewayFeeId);
        if (!existingPaymentGatewayFee) {
            throw new NotFoundException(`Payment Gateway Fee with ID ${paymentGatewayFeeId.toString()} not found`);
        }
        Object.assign(existingPaymentGatewayFee, paymentGatewayFee);
        existingPaymentGatewayFee.updated_by = userId;
        existingPaymentGatewayFee.updated_at = new Date();
        return await this.paymentGatewayFeeRepository.save(existingPaymentGatewayFee);
    }

    async delete(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject, userId: string): Promise<void> {
        const existingPaymentGatewayFee = await this.findOne(paymentGatewayFeeId);
        if (!existingPaymentGatewayFee) {
            throw new NotFoundException(`Payment Gateway Fee with ID ${paymentGatewayFeeId.toString()} not found`);
        }
        await this.paymentGatewayFeeRepository.delete(paymentGatewayFeeId.toString());
    }
}