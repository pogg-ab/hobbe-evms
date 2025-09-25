// src/infrastructure/repositories/verification-request.repository.ts
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  VerificationRequest,
  VerificationStatus,
} from '../../../domain/entities/verification-request.entity';
import { IVerificationRequestRepository } from '../../../domain/repositories/i-verification-request.repositoty';

@Injectable()
export class VerificationRequestRepositoryImpl
  implements IVerificationRequestRepository
{
  constructor(
    @InjectRepository(VerificationRequest)
    private readonly repo: Repository<VerificationRequest>,
  ) {}

  async create(
    verificationRequest: VerificationRequest,
  ): Promise<VerificationRequest> {
    return this.repo.save(verificationRequest);
  }

  async findById(
    verificationRequestId: string,
  ): Promise<VerificationRequest | null> {
    return this.repo.findOne({
      where: { verification_request_id: verificationRequestId },
      relations: ['personal_account', 'reviewed_by'],
    });
  }

  async findByPersonalAccountId(
    personalAccountId: string,
  ): Promise<VerificationRequest | null> {
    return this.repo.findOne({
      where: {
        personal_account: { personal_account_id: personalAccountId } as any,
      },
      order: { submitted_at: 'DESC' },
      relations: ['personal_account', 'reviewed_by'],
    });
  }

  async findPendingByPersonalAccountId(
    personalAccountId: string,
  ): Promise<VerificationRequest | null> {
    return this.repo.findOne({
      where: {
        personal_account: { personal_account_id: personalAccountId } as any,
        status: VerificationStatus.PENDING,
      },
      relations: ['personal_account', 'reviewed_by'],
    });
  }

  async findPendingRequests(): Promise<VerificationRequest[]> {
    return this.repo.find({
      where: { status: VerificationStatus.PENDING },
      relations: ['personal_account', 'reviewed_by'],
      order: { submitted_at: 'ASC' },
    });
  }

  async update(
    verificationRequest: VerificationRequest,
  ): Promise<VerificationRequest> {
    return this.repo.save(verificationRequest);
  }

  async remove(verificationRequestId: string): Promise<void> {
    await this.repo.delete({ verification_request_id: verificationRequestId });
  }

  async findLastByPersonalAccountId(
    personalAccountId: string,
  ): Promise<VerificationRequest | null> {
    return this.repo.findOne({
      where: { personal_account: { personal_account_id: personalAccountId } },
      relations: ['personal_account', 'reviewed_by'],
    });
  }

  async findLastByOrganizationalAccountId(
    orgAccountId: string,
  ): Promise<VerificationRequest | null> {
    return this.repo.findOne({
      where: {
        organizational_account: {
          organizational_account_id: orgAccountId,
        } as any,
      },
      order: { submitted_at: 'DESC' },
      relations: ['organizational_account', 'reviewed_by'],
    });
  }
}
