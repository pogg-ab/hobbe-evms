import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentGatewayFeeService } from 'src/application/services/payment-gateway-fee/payment-gateway-fee.service';
import { GetPaymentGatewayFeeByIdQuery } from 'src/application/queries/payment-gateway-fee/get-payment-gateway-fee-by-id.query';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';

@QueryHandler(GetPaymentGatewayFeeByIdQuery)
export class GetPaymentGatewayFeeByIdQueryHandler implements IQueryHandler<GetPaymentGatewayFeeByIdQuery> {
    constructor(private readonly paymentGatewayFeeService: PaymentGatewayFeeService) { }

    async execute(query: GetPaymentGatewayFeeByIdQuery): Promise<PaymentGatewayFee> {
        return await this.paymentGatewayFeeService.getPaymentGatewayFeeById(query.paymentGatewayFeeId);
    }
}