import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { AuditLog } from 'src/domain/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async logAction(logData: Partial<AuditLog>): Promise<AuditLog> {
    const newLog = this.auditLogRepo.create(logData);
    return this.auditLogRepo.save(newLog);
  }

  async findAll(filter?: { serviceName?: string }): Promise<AuditLog[]> {
    const options: FindManyOptions<AuditLog> = {
      order: { created_at: 'DESC' },
    };

    if (filter && filter.serviceName) {
      options.where = {
        serviceName: filter.serviceName,
      };
    }

    return this.auditLogRepo.find(options);
  }
}
