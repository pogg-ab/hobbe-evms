import { CreatePaymentGatewayFeeDto } from "src/presentation/dtos/payment-gateway-fee/payment-gateway-fee.dto";

export class CreatePaymentGatewayFeeCommand {
    constructor(
        public readonly createPaymentGatewayFeeDto: CreatePaymentGatewayFeeDto,
        public readonly userId: string,
    ) { }
}