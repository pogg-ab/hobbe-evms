import { CommissionFee } from 'src/domain/entities/commission-fee.entity';
import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';

export interface ICommissionFeeRepository {
    create(commissionFee: CommissionFee, userId: string): Promise<CommissionFee>;
    findOne(commissionFeeId: CommissionFeeIdValueObject): Promise<CommissionFee | null>;
    findAll(page: number, limit: number): Promise<{ commissionFees: CommissionFee[] | null; total: number; page: number; limit: number }>;
    update(commissionFeeId: CommissionFeeIdValueObject, commissionFee: Partial<CommissionFee>, userId: string): Promise<CommissionFee>;
    delete(commissionFeeId: CommissionFeeIdValueObject, userId: string): Promise<void>;
}