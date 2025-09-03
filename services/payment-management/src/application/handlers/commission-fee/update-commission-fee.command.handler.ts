import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommissionFeeService } from 'src/application/services/commission-fee/commission-fee.service';
import { UpdateCommissionFeeCommand } from 'src/application/commands/commission-fee/update-commission-fee.command';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';

@CommandHandler(UpdateCommissionFeeCommand)
export class UpdateCommissionFeeCommandHandler implements ICommandHandler<UpdateCommissionFeeCommand> {
    constructor(private readonly commissionFeeService: CommissionFeeService) { }

    async execute(command: UpdateCommissionFeeCommand): Promise<CommissionFee> {
        return await this.commissionFeeService.updateCommissionFee(
            command.commissionFeeId,
            command.updateCommissionFeeDto,
            command.userId,
        );
    }
}