import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm'; // <-- Ensure FindManyOptions is imported
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

  /**
   * --- THIS IS THE UPDATED METHOD ---
   * It now accepts a filter object and builds a dynamic query.
   */
  async findAll(filter?: { serviceName?: string }): Promise<AuditLog[]> {
    const options: FindManyOptions<AuditLog> = {
      order: { created_at: 'DESC' }, // Always a good idea to sort by newest
    };

    // If a serviceName is provided in the filter, add a 'where' clause to the query
    if (filter && filter.serviceName) {
      options.where = {
        serviceName: filter.serviceName,
      };
    }

    // If no filter is provided, it will find all logs.
    return this.auditLogRepo.find(options);
  }
}