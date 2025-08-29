import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';
import { IPaymentGatewayFeeRepository } from 'src/domain/repositories/payment-gateway-fee/payment-gateway-fee.repository';
import { CreatePaymentGatewayFeeDto, UpdatePaymentGatewayFeeDto } from 'src/presentation/dtos/payment-gateway-fee/payment-gateway-fee.dto';
import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';
import { PAYMENT_GATEWAY_FEE_REPOSITORY_TOKEN } from 'src/domain/repositories/payment-gateway-fee/payment-gateway-fee.repository.token';

@Injectable()
export class PaymentGatewayFeeService {
    constructor(
        @Inject(PAYMENT_GATEWAY_FEE_REPOSITORY_TOKEN)
        private readonly paymentGatewayFeeRepository: IPaymentGatewayFeeRepository,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async createPaymentGatewayFee(createPaymentGatewayFeeDto: CreatePaymentGatewayFeeDto, userId: string): Promise<PaymentGatewayFee> {
        const paymentGatewayFee = this.mapper.map(createPaymentGatewayFeeDto, CreatePaymentGatewayFeeDto, PaymentGatewayFee);
        return await this.paymentGatewayFeeRepository.create(paymentGatewayFee, userId);
    }

    async getPaymentGatewayFeeById(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject): Promise<PaymentGatewayFee> {
        const paymentGatewayFee = await this.paymentGatewayFeeRepository.findOne(paymentGatewayFeeId);
        if (!paymentGatewayFee) {
            throw new NotFoundException(`Payment Gateway Fee with ID ${paymentGatewayFeeId.toString()} not found`);
        }
        return paymentGatewayFee;
    }

    async getAllPaymentGatewayFees(page: number, limit: number): Promise<{ paymentGatewayFees: PaymentGatewayFee[] | null; total: number; page: number; limit: number; totalPages: number }> {
        const result = await this.paymentGatewayFeeRepository.findAll(page, limit);
        return {
            ...result,
            totalPages: result.paymentGatewayFees ? Math.ceil(result.total / result.limit) : 0,
        };
    }

    async updatePaymentGatewayFee(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject, updatePaymentGatewayFeeDto: UpdatePaymentGatewayFeeDto, userId: string): Promise<PaymentGatewayFee> {
        const paymentGatewayFee = await this.paymentGatewayFeeRepository.findOne(paymentGatewayFeeId);
        if (!paymentGatewayFee) {
            throw new NotFoundException(`Payment Gateway Fee with ID ${paymentGatewayFeeId.toString()} not found`);
        }
        const updatedPaymentGatewayFee = this.mapper.map(updatePaymentGatewayFeeDto, UpdatePaymentGatewayFeeDto, PaymentGatewayFee);
        return await this.paymentGatewayFeeRepository.update(paymentGatewayFeeId, updatedPaymentGatewayFee, userId);
    }

    async deletePaymentGatewayFee(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject, userId: string): Promise<void> {
        await this.paymentGatewayFeeRepository.delete(paymentGatewayFeeId, userId);
    }
}