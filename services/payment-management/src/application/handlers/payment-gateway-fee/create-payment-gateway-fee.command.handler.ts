import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentGatewayFeeService } from 'src/application/services/payment-gateway-fee/payment-gateway-fee.service';
import { CreatePaymentGatewayFeeCommand } from 'src/application/commands/payment-gateway-fee/create-payment-gateway-fee.command';
import { PaymentGatewayFee } from 'src/domain/entities/payment-gateway-fee.entity';

@CommandHandler(CreatePaymentGatewayFeeCommand)
export class CreatePaymentGatewayFeeCommandHandler implements ICommandHandler<CreatePaymentGatewayFeeCommand> {
    constructor(private readonly paymentGatewayFeeService: PaymentGatewayFeeService) { }

    async execute(command: CreatePaymentGatewayFeeCommand): Promise<PaymentGatewayFee> {
        return await this.paymentGatewayFeeService.createPaymentGatewayFee(command.createPaymentGatewayFeeDto, command.userId);
    }
}