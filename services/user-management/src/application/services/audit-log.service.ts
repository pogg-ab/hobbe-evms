import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AuditLog,
  ActionType,
  ActionResult,
} from '../../domain/entities/audit-log.entity';
import { FindAuditLogsDto } from '../../presentation/dtos/find-audit-logs.dto';
import Papa from 'papaparse';

export interface CreateLogParams {
  serviceName: string;
  actorId: string | null; // <-- CHANGE THIS from 'string' to 'string | null'
  actorType: string;
  actionType: ActionType;
  targetEntity: string;
  result: ActionResult;
  ipAddress?: string;
  targetEntityId?: string;
  details?: Record<string, any>;
}
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly serviceName = 'user-management'; // <-- ADDED

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(params: CreateLogParams): Promise<AuditLog> {
    try {
      const newLog = this.auditLogRepository.create(params);
      return await this.auditLogRepository.save(newLog);
    } catch (error) {
      this.logger.error('Failed to create audit log', { params, error });
      return null;
    }
  }

  async find(filterDto: FindAuditLogsDto): Promise<{ data: AuditLog[]; total: number }> {
    const { page = 1, limit = 10, actorId, actionType, targetEntity, fromDate, toDate, result } = filterDto;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    // --- CRITICAL FILTER FOR DATA ISOLATION ---
    queryBuilder.where('log.serviceName = :serviceName', { serviceName: this.serviceName });

    if (actorId) {
      queryBuilder.andWhere('log.actorId = :actorId', { actorId });
    }
    if (actionType) {
      queryBuilder.andWhere('log.actionType = :actionType', { actionType });
    }
    if (targetEntity) {
      queryBuilder.andWhere('log.targetEntity = :targetEntity', { targetEntity });
    }
    if (result) {
      queryBuilder.andWhere('log.result = :result', { result });
    }
    if (fromDate) {
      queryBuilder.andWhere('log.timestamp >= :fromDate', { fromDate });
    }
    if (toDate) {
      queryBuilder.andWhere('log.timestamp <= :toDate', { toDate });
    }

    queryBuilder
      .orderBy('log.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    
    return { data, total };
  }

  async exportToCsv(filterDto: FindAuditLogsDto): Promise<string> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('log');

    // --- CRITICAL FILTER FOR DATA ISOLATION ---
    queryBuilder.where('log.serviceName = :serviceName', { serviceName: this.serviceName });

    const { actorId, actionType, targetEntity, fromDate, toDate, result } = filterDto;

    if (actorId) {
      queryBuilder.andWhere('log.actorId = :actorId', { actorId });
    }
    // ... rest of filters
    
    const logs = await queryBuilder.orderBy('log.timestamp', 'DESC').getMany();

    if (logs.length === 0) {
      return '';
    }

    const formattedLogs = logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      serviceName: log.serviceName, // <-- ADDED
      actorId: log.actorId,
      actorType: log.actorType,
      ipAddress: log.ipAddress,
      actionType: log.actionType,
      targetEntity: log.targetEntity,
      targetEntityId: log.targetEntityId,
      result: log.result,
      details: JSON.stringify(log.details),
    }));

    const csv = Papa.unparse(formattedLogs);
    return csv;
  }

  async delete(id: string): Promise<void> {
    const result = await this.auditLogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Audit log with ID "${id}" not found`);
    }
  }

  async deleteAll(): Promise<{ message: string; deletedCount: number }> {
    const count = await this.auditLogRepository.count();
    await this.auditLogRepository.clear();
    return {
      message: 'All audit logs have been successfully deleted.',
      deletedCount: count,
    };
  }
}