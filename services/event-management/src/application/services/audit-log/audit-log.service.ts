import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
   * --- THIS IS THE FIX ---
   * This method MUST have a 'where' clause to filter by its own service name.
   */
  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: {
        serviceName: 'event-management', // <-- THIS LINE IS THE FIX
      },
      order: {
        created_at: 'DESC',
      },
    });
  }
}