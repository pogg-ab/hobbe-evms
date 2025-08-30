import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaymentGatewayFeeService } from 'src/application/services/payment-gateway-fee/payment-gateway-fee.service';
import { GetAllPaymentGatewayFeesQuery } from 'src/application/queries/payment-gateway-fee/get-all-payment-gateway-fees.query';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';

@QueryHandler(GetAllPaymentGatewayFeesQuery)
export class GetAllPaymentGatewayFeesQueryHandler implements IQueryHandler<GetAllPaymentGatewayFeesQuery> {
    constructor(private readonly paymentGatewayFeeService: PaymentGatewayFeeService) { }

    async execute(query: GetAllPaymentGatewayFeesQuery): Promise<{ paymentGatewayFees: PaymentGatewayFee[] | null; total: number; page: number; limit: number; totalPages: number }> {
        return await this.paymentGatewayFeeService.getAllPaymentGatewayFees(query.page, query.limit);
    }
}