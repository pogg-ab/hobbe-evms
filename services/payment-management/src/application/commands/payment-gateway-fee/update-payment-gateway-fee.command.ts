import { UpdatePaymentGatewayFeeDto } from "src/presentation/dtos/payment-gateway-fee/payment-gateway-fee.dto";
import { PaymentGatewayFeeIdValueObject } from 'src/domain/value-objects/payment-gateway-fee-id.value-object';

export class UpdatePaymentGatewayFeeCommand {
    constructor(
        public readonly paymentGatewayFeeId: PaymentGatewayFeeIdValueObject,
        public readonly updatePaymentGatewayFeeDto: UpdatePaymentGatewayFeeDto,
        public readonly userId: string,
    ) { }
}