import { SetMetadata } from '@nestjs/common';
import { ActionType } from '../../domain/entities/audit-log.entity';

export const AUDIT_LOG_METADATA_KEY = 'auditLogMetadata';

export interface AuditLogMetadata {
  actionType: ActionType;
  targetEntity: string;
}

/**
 * A custom decorator to mark controller methods for audit logging.
 * @param metadata - The metadata for the audit log entry.
 * @example
 * @Post('login')
 * @AuditLog({ actionType: ActionType.LOGIN, targetEntity: 'UserSession' })
 * login(@Body() body: LoginDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_METADATA_KEY, metadata);