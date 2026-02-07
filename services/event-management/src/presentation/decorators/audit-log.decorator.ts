import { SetMetadata } from '@nestjs/common';
import { ActionType } from '../../domain/entities/audit-log.entity';
export const AUDIT_LOG_METADATA_KEY = 'auditLogMetadata';

export interface AuditLogMetadata {
  actionType: ActionType;
  targetEntity: string;
}

export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_METADATA_KEY, metadata);