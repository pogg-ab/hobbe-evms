import { EntityManager } from 'typeorm';
import { KYC } from '../entities/kyc.entity';

export interface IKYCRepository {
  create(manager: EntityManager, kyc: KYC): Promise<KYC>;
  findOneById(kycId: string): Promise<KYC | null>;
  update(kycId: string, kyc: KYC): Promise<KYC>;
  remove(kycId: string): Promise<void>;
}
