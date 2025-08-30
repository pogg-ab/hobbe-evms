import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';
import { ICommissionFeeRepository } from 'src/domain/repositories/commission-fee/commission-fee.repository';
import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommissionFeeRepositoryImpl implements ICommissionFeeRepository {
    constructor(
        @InjectRepository(CommissionFee)
        private readonly commissionFeeRepository: Repository<CommissionFee>,
    ) { }

    async create(commissionFee: CommissionFee, userId: string): Promise<CommissionFee> {
        commissionFee.commission_fee_id = new CommissionFeeIdValueObject(uuidv4());
        commissionFee.created_by = userId;
        commissionFee.created_at = new Date();
        return await this.commissionFeeRepository.save(commissionFee);
    }

    async findOne(commissionFeeId: CommissionFeeIdValueObject): Promise<CommissionFee | null> {
        return await this.commissionFeeRepository.findOne({ where: { commission_fee_id: commissionFeeId.toString() } });
    }

    async findAll(page: number, limit: number): Promise<{ commissionFees: CommissionFee[] | null; total: number; page: number; limit: number }> {
        const [commissionFees, total] = await this.commissionFeeRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { commissionFees: commissionFees.length ? commissionFees : null, total, page, limit };
    }

    async update(commissionFeeId: CommissionFeeIdValueObject, commissionFee: Partial<CommissionFee>, userId: string): Promise<CommissionFee> {
        const existingCommissionFee = await this.findOne(commissionFeeId);
        if (!existingCommissionFee) {
            throw new NotFoundException(`Commission Fee with ID ${commissionFeeId.toString()} not found`);
        }
        Object.assign(existingCommissionFee, commissionFee);
        existingCommissionFee.updated_by = userId;
        existingCommissionFee.updated_at = new Date();
        return await this.commissionFeeRepository.save(existingCommissionFee);
    }

    async delete(commissionFeeId: CommissionFeeIdValueObject, userId: string): Promise<void> {
        const existingCommissionFee = await this.findOne(commissionFeeId);
        if (!existingCommissionFee) {
            throw new NotFoundException(`Commission Fee with ID ${commissionFeeId.toString()} not found`);
        }
        await this.commissionFeeRepository.delete(commissionFeeId.toString());
    }
}