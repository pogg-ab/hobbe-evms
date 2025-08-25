import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject, // <-- IMPORT Inject
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices'; // <-- IMPORT ClientKafka
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from 'src/application/services/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    // --- INJECT THE KAFKA CLIENT ---
    // Make sure 'KAFKA_PRODUCER' is provided in the module where this interceptor is used.
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, params, body, user } = request;
    
    return next.handle().pipe(
      tap(async () => {
        if (method !== 'GET') {
          const logData = {
            user_id: user?.admin_user_id || user?.user_id,
            action: `${method} ${url.split('?')[0]}`,
            module: context.getClass().name,
            
            // --- ADD THE SERVICE NAME ---
            serviceName: 'user-management', // This is hardcoded for this service

            target_id: params.id,
            details: { body: body },
            ip_address: request.ip,
          };

          // 1. Log the action locally (your existing, working logic)
          const createdLog = await this.auditLogService.logAction(logData);

          // 2. Emit the created log to Kafka for centralization
          // We send the full log object so the central service has all the data.
          this.kafkaClient.emit('audit_log_created', createdLog);
        }
      }),
    );
  }
}