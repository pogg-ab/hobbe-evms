import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';

export class GetPaymentGatewayFeeByIdQuery {
    constructor(public readonly paymentGatewayFeeId: PaymentGatewayFeeIdValueObject) { }
}