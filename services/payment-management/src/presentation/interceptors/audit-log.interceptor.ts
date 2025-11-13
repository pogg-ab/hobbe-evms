// src/presentation/interceptors/audit-log.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger, // <-- IMPORT LOGGER
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
// Your paths are preserved
import { AuditLogService, CreateLogParams } from '../../application/services/audit-log/audit-log.service';
import { ActionResult } from '../../domain/entities/audit-log.entity';
import {
  AUDIT_LOG_METADATA_KEY,
  AuditLogMetadata,
} from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name); // <-- INSTANTIATE LOGGER
  private readonly serviceName = 'payment-management';

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_METADATA_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, body, params } = request;
    const actorId = user?.user?.user_id || user?.sub || null;

    return next.handle().pipe(
      tap(async (data) => {
        // --- RESILIENCY FIX: Wrap logging in a try...catch block ---
        try {
          const logParams: CreateLogParams = {
            actorId,
            actionType: metadata.actionType,
            targetEntity: metadata.targetEntity,
            targetId: params?.id || data?.id || null,
            result: ActionResult.SUCCESS,
            details: { requestBody: this.sanitizeBody(body), responseBody: data },
          };
          const createdLog = await this.auditLogService.create(logParams);
          if (createdLog) {
            this.kafkaClient.emit('audit_log_created', createdLog);
          }
        } catch (logError) {
          // If logging fails, report the error to the console but DO NOT throw.
          this.logger.error('Failed to create SUCCESS audit log.', logError.stack);
        }
      }),
      catchError(async (err) => {
        // --- RESILIENCY FIX: Wrap logging in its own try...catch block ---
        try {
          const logParams: CreateLogParams = {
            actorId,
            actionType: metadata.actionType,
            targetEntity: metadata.targetEntity,
            targetId: params?.id || null,
            result: ActionResult.FAILURE,
            details: {
              requestBody: this.sanitizeBody(body),
              error: { name: err.name, message: err.message, statusCode: err.status },
            },
          };
          const createdLog = await this.auditLogService.create(logParams);
          if (createdLog) {
            this.kafkaClient.emit('audit_log_created', createdLog);
          }
        } catch (logError) {
          // If logging fails, report the error to the console but DO NOT throw.
          this.logger.error('Failed to create FAILURE audit log.', logError.stack);
        }

        // Always re-throw the original application error to the user.
        return throwError(() => err);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    const sanitizedBody = { ...body };
    const sensitiveKeys = ['password', 'confirmPassword', 'token', 'accessToken', 'card', 'cvc'];
    for (const key of sensitiveKeys) {
      if (sanitizedBody[key]) sanitizedBody[key] = '[REDACTED]';
    }
    return sanitizedBody;
  }
}