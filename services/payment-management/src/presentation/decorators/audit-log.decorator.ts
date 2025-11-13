// src/audit-log/audit-log.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { ActionType } from '../../domain/entities/audit-log.entity';

// This unique key will be used by the interceptor to find our metadata.
export const AUDIT_LOG_METADATA_KEY = 'auditLogMetadata';

// This interface defines the shape of the data our decorator will accept.
export interface AuditLogMetadata {
  actionType: ActionType;
  targetEntity: string;
}

/**
 * Decorator to mark a controller method for audit logging.
 * It attaches metadata that the AuditLogInterceptor will read.
 *
 * @param metadata The metadata describing the action to be logged.
 *
 * @example
 * @AuditLog({ actionType: ActionType.CREATE_PAYMENT_INTENT, targetEntity: 'PaymentIntent' })
 * @Post()
 * createPaymentIntent(@Body() dto: CreatePaymentDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_METADATA_KEY, metadata);