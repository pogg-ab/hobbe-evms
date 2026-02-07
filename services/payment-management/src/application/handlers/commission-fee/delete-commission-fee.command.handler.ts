import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommissionFeeService } from 'src/application/services/commission-fee/commission-fee.service';
import { DeleteCommissionFeeCommand } from 'src/application/commands/commission-fee/delete-commission-fee.command';

@CommandHandler(DeleteCommissionFeeCommand)
export class DeleteCommissionFeeCommandHandler implements ICommandHandler<DeleteCommissionFeeCommand> {
    constructor(private readonly commissionFeeService: CommissionFeeService) { }

    async execute(command: DeleteCommissionFeeCommand): Promise<void> {
        await this.commissionFeeService.deleteCommissionFee(command.commissionFeeId, command.userId);
    }
}