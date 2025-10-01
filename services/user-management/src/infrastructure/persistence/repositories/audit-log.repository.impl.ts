import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { IAuditLogRepository } from 'src/domain/repositories/audit-log.repository';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogRepositoryImpl implements IAuditLogRepository {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  async create(log: AuditLog): Promise<AuditLog> {
    return this.repository.save(log);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.repository.find({ order: { created_at: 'DESC' } });
  }
}
