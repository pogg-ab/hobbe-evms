import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KYC } from 'src/domain/entities/kyc.entity';
import { IKYCRepository } from 'src/domain/repositories/kyc.repository';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class KYCRepositoryImpl implements IKYCRepository {
  constructor(
    @InjectRepository(KYC)
    private readonly kycRepository: Repository<KYC>,
  ) {}

  async create(manager: EntityManager, kyc: KYC): Promise<KYC> {
    try {
      const newKyc = this.kycRepository.create(kyc);
      return await manager.save(newKyc);
    } catch (error) {
      throw new HttpException(
        `Error creating KYC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneById(kycId: string): Promise<KYC | null> {
    try {
      return await this.kycRepository.findOne({ where: { kyc_id: kycId } });
    } catch (error) {
      throw new HttpException(
        `Error fetching KYC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(kycId: string, kyc: KYC): Promise<KYC> {
    try {
      await this.kycRepository.update(kycId, kyc);
      return await this.kycRepository.findOne({ where: { kyc_id: kycId } });
    } catch (error) {
      throw new HttpException(
        `Error updating KYC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(kycId: string): Promise<void> {
    try {
      await this.kycRepository.delete(kycId);
    } catch (error) {
      throw new HttpException(
        `Error deleting KYC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
