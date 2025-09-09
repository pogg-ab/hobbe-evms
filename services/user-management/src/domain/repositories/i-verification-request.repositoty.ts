// src/domain/repositories/i-verification-request.repository.ts
import { VerificationRequest } from '../entities/verification-request.entity';

export interface IVerificationRequestRepository {
  create(verificationRequest: VerificationRequest): Promise<VerificationRequest>;
  findById(verificationRequestId: string): Promise<VerificationRequest | null>;
  findByPersonalAccountId(personalAccountId: string): Promise<VerificationRequest | null>;
  findPendingByPersonalAccountId(personalAccountId: string): Promise<VerificationRequest | null>;
  findPendingRequests(): Promise<VerificationRequest[]>;
  update(verificationRequest: VerificationRequest): Promise<VerificationRequest>;
  remove(verificationRequestId: string): Promise<void>;
  findLastByPersonalAccountId(personalAccountId: string): Promise<VerificationRequest | null>
}
