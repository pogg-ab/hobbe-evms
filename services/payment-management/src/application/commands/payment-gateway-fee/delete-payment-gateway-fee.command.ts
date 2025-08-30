import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';

export class DeletePaymentGatewayFeeCommand {
    constructor(
        public readonly paymentGatewayFeeId: PaymentGatewayFeeIdValueObject,
        public readonly userId: string,
    ) { }
}