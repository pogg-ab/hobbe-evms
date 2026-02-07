import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommissionFeeService } from 'src/application/services/commission-fee/commission-fee.service';
import { CreateCommissionFeeCommand } from 'src/application/commands/commission-fee/create-commission-fee.command';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';

@CommandHandler(CreateCommissionFeeCommand)
export class CreateCommissionFeeCommandHandler implements ICommandHandler<CreateCommissionFeeCommand> {
    constructor(private readonly commissionFeeService: CommissionFeeService) { }

    async execute(command: CreateCommissionFeeCommand): Promise<CommissionFee> {
        return await this.commissionFeeService.createCommissionFee(command.createCommissionFeeDto, command.userId);
    }
}