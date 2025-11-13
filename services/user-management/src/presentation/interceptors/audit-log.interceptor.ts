import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger, // <-- ADDED
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  AuditLogService,
  CreateLogParams,
} from '../../application/services/audit-log.service';
import { ActionResult, ActionType } from '../../domain/entities/audit-log.entity';
import {
  AUDIT_LOG_METADATA_KEY,
  AuditLogMetadata,
} from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name); // <-- ADDED
  private readonly serviceName = 'user-management';

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
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
    const actorId = user?.id || user?.sub || null;
    const actorType = user?.role || (actorId ? 'user' : 'guest');

    return next.handle().pipe(
      tap(async (data) => {
        // --- RESILIENCY FIX ---
        try {
          let finalActorId = actorId;
          let finalActorType = actorType;

          // --- KEEP THIS SPECIAL LOGIN LOGIC ---
          if (metadata.actionType === ActionType.LOGIN && data?.access_token) {
            try {
              const decodedToken: any = this.jwtService.decode(data.access_token);
              if (decodedToken && decodedToken.sub) {
                finalActorId = decodedToken.sub;
                finalActorType = decodedToken.isAdmin ? 'admin' : 'user';
              }
            } catch (e) {
              console.error('Failed to decode token for audit log:', e);
            }
          }

          const logParams: CreateLogParams = {
            serviceName: this.serviceName,
            actorId: finalActorId,
            actorType: finalActorType,
            ipAddress: ip,
            actionType: metadata.actionType,
            targetEntity: metadata.targetEntity,
            targetEntityId: params?.id || data?.id,
            result: ActionResult.SUCCESS,
            details: {
              requestBody: this.sanitizeBody(body),
              responseBody: data,
            },
          };
          await this.auditLogService.create(logParams);
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
          await this.auditLogService.create(logParams);
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