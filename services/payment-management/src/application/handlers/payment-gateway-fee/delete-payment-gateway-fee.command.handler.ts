import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentGatewayFeeService } from 'src/application/services/payment-gateway-fee/payment-gateway-fee.service';
import { DeletePaymentGatewayFeeCommand } from 'src/application/commands/payment-gateway-fee/delete-payment-gateway-fee.command';

@CommandHandler(DeletePaymentGatewayFeeCommand)
export class DeletePaymentGatewayFeeCommandHandler implements ICommandHandler<DeletePaymentGatewayFeeCommand> {
    constructor(private readonly paymentGatewayFeeService: PaymentGatewayFeeService) { }

    async execute(command: DeletePaymentGatewayFeeCommand): Promise<void> {
        await this.paymentGatewayFeeService.deletePaymentGatewayFee(command.paymentGatewayFeeId, command.userId);
    }
}