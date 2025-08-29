import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';

export class DeleteCommissionFeeCommand {
    constructor(
        public readonly commissionFeeId: CommissionFeeIdValueObject,
        public readonly userId: string,
    ) { }
}