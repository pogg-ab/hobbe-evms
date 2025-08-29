import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentGatewayFeeService } from 'src/application/services/payment-gateway-fee/payment-gateway-fee.service';
import { UpdatePaymentGatewayFeeCommand } from 'src/application/commands/payment-gateway-fee/update-payment-gateway-fee.command';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';

@CommandHandler(UpdatePaymentGatewayFeeCommand)
export class UpdatePaymentGatewayFeeCommandHandler implements ICommandHandler<UpdatePaymentGatewayFeeCommand> {
    constructor(private readonly paymentGatewayFeeService: PaymentGatewayFeeService) { }

    async execute(command: UpdatePaymentGatewayFeeCommand): Promise<PaymentGatewayFee> {
        return await this.paymentGatewayFeeService.updatePaymentGatewayFee(
            command.paymentGatewayFeeId,
            command.updatePaymentGatewayFeeDto,
            command.userId,
        );
    }
}