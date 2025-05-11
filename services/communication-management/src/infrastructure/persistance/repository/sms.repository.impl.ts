import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SMS } from 'src/domain/entities/sms.entity';
import { ISMSRepository } from 'src/domain/repositories/sms/sms.repository';
import { SMSID } from 'src/domain/value-objects/sms-id.value-object';
import { Repository } from 'typeorm';

@Injectable()
export class SMSRepositoryImpl implements ISMSRepository {
  constructor(
    @InjectRepository(SMS)
    private readonly smsRepository: Repository<SMS>,
  ) {}

  async create(sms: SMS): Promise<SMS> {
    return this.smsRepository.save(sms);
  }

  async findAll(): Promise<SMS[]> {
    return this.smsRepository.find();
  }

  async findOneById(id: SMSID): Promise<SMS | null> {
    return this.smsRepository.findOne({
      where: { id: id.toString() },
    });
  }

  async update(id: SMSID, sms: SMS): Promise<SMS> {
    const existingSMS = await this.findOneById(id);
    if (!existingSMS) {
      throw new Error(`SMS with ID ${id.toString()} not found`);
    }

    Object.assign(existingSMS, sms);
    return this.smsRepository.save(existingSMS);
  }

  async delete(id: SMSID): Promise<void> {
    const existingSMS = await this.findOneById(id);
    if (!existingSMS) {
      throw new Error(`SMS with ID ${id.toString()} not found`);
    }

    await this.smsRepository.delete(id.toString());
  }

  async updateStatus(
    id: SMSID,
    status: 'SENT' | 'FAILED' | 'PENDING' | null,
  ): Promise<void> {
    const sms = await this.findOneById(id);
    if (!sms) {
      throw new Error(`SMS with ID ${id.toString()} not found`);
    }

    sms.status = status;
    await this.smsRepository.save(sms);
  }
}
