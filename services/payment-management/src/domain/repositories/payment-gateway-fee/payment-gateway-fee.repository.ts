import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';
import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';

export interface IPaymentGatewayFeeRepository {
    create(paymentGatewayFee: PaymentGatewayFee, userId: string): Promise<PaymentGatewayFee>;
    findOne(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject): Promise<PaymentGatewayFee | null>;
    findAll(page: number, limit: number): Promise<{ paymentGatewayFees: PaymentGatewayFee[] | null; total: number; page: number; limit: number }>;
    update(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject, paymentGatewayFee: Partial<PaymentGatewayFee>, userId: string): Promise<PaymentGatewayFee>;
    delete(paymentGatewayFeeId: PaymentGatewayFeeIdValueObject, userId: string): Promise<void>;
}