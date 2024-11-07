import { KYC } from '../entities/kyc.entity';

export interface IKYCRepository {
  create(kyc: KYC): Promise<KYC>;
  findOneById(kycId: string): Promise<KYC | null>;
  update(kycId: string, kyc: KYC): Promise<KYC>;
  remove(kycId: string): Promise<void>;
}
