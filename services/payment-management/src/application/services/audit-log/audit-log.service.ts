import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AuditLog, ActionType, ActionResult, ActorType } from '../../../domain/entities/audit-log.entity';
import { FindAuditLogsDto } from '../../../presentation/dtos/find-audit-logs/find-audit-logs.dto'
import * as Papa from 'papaparse';

export interface CreateLogParams {
  actorId: string | null;
  actionType: ActionType;
  result: ActionResult;
  actorType?: ActorType;
  targetEntity?: string;
  targetId?: string;
  details?: object;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly SERVICE_NAME = 'payment-management';

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) { }


  async create(params: CreateLogParams): Promise<AuditLog> {
    try {
      const newLog = this.auditLogRepository.create({
        ...params,
        serviceName: this.SERVICE_NAME,
      });
      return await this.auditLogRepository.save(newLog);
    } catch (error) {
      this.logger.error('Failed to create audit log', error.stack);
      throw error;
    }
  }

  async find(
    filterDto: FindAuditLogsDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      actorId,
      actionType,
      targetEntity,
      result,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const query: SelectQueryBuilder<AuditLog> =
      this.auditLogRepository.createQueryBuilder('log');

    query.where('log.serviceName = :serviceName', {
      serviceName: this.SERVICE_NAME,
    });

    if (actorId) {
      query.andWhere('log.actorId = :actorId', { actorId });
    }
    if (actionType) {
      query.andWhere('log.actionType = :actionType', { actionType });
    }
    if (targetEntity) {
      query.andWhere('log.targetEntity = :targetEntity', { targetEntity });
    }
    if (result) {
      query.andWhere('log.result = :result', { result });
    }
    if (startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      const inclusiveEndDate = new Date(endDate);
      inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
      query.andWhere('log.createdAt < :inclusiveEndDate', { inclusiveEndDate });
    }

    query
      .orderBy(`log.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }


  async exportToCsv(filterDto: FindAuditLogsDto): Promise<string> {
    const { data: logs } = await this.find({ ...filterDto, page: 1, limit: 0 });

    if (logs.length === 0) {
      return '';
    }

    return Papa.unparse(logs);
  }


  async delete(id: string): Promise<void> {
    const result = await this.auditLogRepository.delete({
      id,
      serviceName: this.SERVICE_NAME,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Audit log with ID "${id}" not found.`);
    }
  }

  async deleteAll(): Promise<void> {
    await this.auditLogRepository.delete({ serviceName: this.SERVICE_NAME });
    this.logger.warn(`All audit logs for service "${this.SERVICE_NAME}" have been deleted.`);
  }
}