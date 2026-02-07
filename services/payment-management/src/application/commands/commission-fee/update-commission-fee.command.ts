import { UpdateCommissionFeeDto } from "src/presentation/dtos/commission-fee/commission-fee.dto";
import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';

export class UpdateCommissionFeeCommand {
    constructor(
        public readonly commissionFeeId: CommissionFeeIdValueObject,
        public readonly updateCommissionFeeDto: UpdateCommissionFeeDto,
        public readonly userId: string,
    ) { }
}