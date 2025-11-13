import { SetMetadata } from '@nestjs/common';
import { ActionType } from '../../domain/entities/audit-log.entity';

// This unique key will be used to store and retrieve the metadata.
export const AUDIT_LOG_METADATA_KEY = 'auditLogMetadata';

// This interface defines the shape of the metadata our decorator will accept.
export interface AuditLogMetadata {
  actionType: ActionType;
  targetEntity: string;
}

/**
 * Decorator to mark a controller method for audit logging.
 * @param metadata The metadata describing the action to be logged.
 * 
 * @example
 * @AuditLog({ actionType: ActionType.CREATE_EVENT, targetEntity: 'Event' })
 * @Post()
 * createEvent(@Body() createEventDto: CreateEventDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_METADATA_KEY, metadata);