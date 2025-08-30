import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';

export class GetCommissionFeeByIdQuery {
    constructor(public readonly commissionFeeId: CommissionFeeIdValueObject) { }
}