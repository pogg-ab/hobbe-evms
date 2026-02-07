import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { CommissionFee } from 'src/domain/entities/commission-fee.entity';
import { ICommissionFeeRepository } from 'src/domain/repositories/commission-fee/commission-fee.repository';
import { CreateCommissionFeeDto, UpdateCommissionFeeDto } from 'src/presentation/dtos/commission-fee/commission-fee.dto';
import { CommissionFeeIdValueObject } from 'src/domain/value-objects/commission-fee-id.value-object';
import { COMMISSION_FEE_REPOSITORY_TOKEN } from 'src/domain/repositories/commission-fee/commission-fee.repository.token';

@Injectable()
export class CommissionFeeService {
    constructor(
        @Inject(COMMISSION_FEE_REPOSITORY_TOKEN)
        private readonly commissionFeeRepository: ICommissionFeeRepository,
        @InjectMapper()
        private readonly mapper: Mapper,
    ) { }

    async createCommissionFee(createCommissionFeeDto: CreateCommissionFeeDto, userId: string): Promise<CommissionFee> {
        const commissionFee = this.mapper.map(createCommissionFeeDto, CreateCommissionFeeDto, CommissionFee);
        return await this.commissionFeeRepository.create(commissionFee, userId);
    }

    async getCommissionFeeById(commissionFeeId: CommissionFeeIdValueObject): Promise<CommissionFee> {
        const commissionFee = await this.commissionFeeRepository.findOne(commissionFeeId);
        if (!commissionFee) {
            throw new NotFoundException(`Commission Fee with ID ${commissionFeeId.toString()} not found`);
        }
        return commissionFee;
    }

    async getAllCommissionFees(page: number, limit: number): Promise<{ commissionFees: CommissionFee[] | null; total: number; page: number; limit: number; totalPages: number }> {
        const result = await this.commissionFeeRepository.findAll(page, limit);
        return {
            ...result,
            totalPages: result.commissionFees ? Math.ceil(result.total / result.limit) : 0,
        };
    }

    async updateCommissionFee(commissionFeeId: CommissionFeeIdValueObject, updateCommissionFeeDto: UpdateCommissionFeeDto, userId: string): Promise<CommissionFee> {
        const commissionFee = await this.commissionFeeRepository.findOne(commissionFeeId);
        if (!commissionFee) {
            throw new NotFoundException(`Commission Fee with ID ${commissionFeeId.toString()} not found`);
        }
        const updatedCommissionFee = this.mapper.map(updateCommissionFeeDto, UpdateCommissionFeeDto, CommissionFee);
        return await this.commissionFeeRepository.update(commissionFeeId, updatedCommissionFee, userId);
    }

    async deleteCommissionFee(commissionFeeId: CommissionFeeIdValueObject, userId: string): Promise<void> {
        await this.commissionFeeRepository.delete(commissionFeeId, userId);
    }
}