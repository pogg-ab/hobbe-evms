import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger, // <-- ADDED
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AuditLogService,
  CreateLogParams,
} from '../../application/services/audit-log/audit-log.service';
import { ActionResult, ActionType } from '../../domain/entities/audit-log.entity';
import {
  AUDIT_LOG_METADATA_KEY,
  AuditLogMetadata,
} from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name); // <-- ADDED
  private readonly serviceName = 'event-management';

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
    const { user, ip, body, params } = request;
    const actorId = user?.user?.user_id || user?.sub || null;
    const actorType = user?.user?.role || (actorId ? 'user' : 'guest');

    return next.handle().pipe(
      tap(async (data) => {
        // --- RESILIENCY FIX ---
        try {
          const logParams: CreateLogParams = {
            serviceName: this.serviceName,
            actorId,
            actorType,
            ipAddress: ip,
            actionType: metadata.actionType,
            targetEntity: metadata.targetEntity,
            targetEntityId: params?.id || data?.id || (data?.events ? data.events.id : null),
            result: ActionResult.SUCCESS,
            details: {
              requestBody: this.sanitizeBody(body),
              responseBody: data,
            },
          };
          const createdLog = await this.auditLogService.create(logParams);
          if (createdLog) {
            this.kafkaClient.emit('audit_log_created', createdLog);
          }
        } catch (logError) {
          this.logger.error('Failed to create SUCCESS audit log.', logError.stack);
        }
      }),
      catchError(async (err) => {
        // --- RESILIENCY FIX ---
        try {
          const logParams: CreateLogParams = {
            serviceName: this.serviceName,
            actorId,
            actorType,
            ipAddress: ip,
            actionType: metadata.actionType,
            targetEntity: metadata.targetEntity,
            targetEntityId: params?.id,
            result: ActionResult.FAILURE,
            details: {
              requestBody: this.sanitizeBody(body),
              error: {
                name: err.name,
                message: err.message,
                statusCode: err.status,
              },
            },
          };
          const createdLog = await this.auditLogService.create(logParams);
          if (createdLog) {
            this.kafkaClient.emit('audit_log_created', createdLog);
          }
        } catch (logError) {
          this.logger.error('Failed to create FAILURE audit log.', logError.stack);
        }
        
        return throwError(() => err);
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }
    const sanitizedBody = { ...body };
    const sensitiveKeys = ['password', 'confirmPassword', 'token', 'accessToken'];
    for (const key of sensitiveKeys) {
      if (sanitizedBody[key]) {
        sanitizedBody[key] = '[REDACTED]';
      }
    }
    return sanitizedBody;
  }
}