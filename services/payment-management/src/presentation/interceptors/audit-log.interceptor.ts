import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service'; // Adjust path if needed

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    // Inject the Kafka client. This will be provided by the AuditLogModule.
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, params, body, user } = request;
    
    return next.handle().pipe(
      tap(async () => {
        if (method !== 'GET') {
          const logData = {
            user_id: user?.userId, // The JWT payload from AdminJwtStrategy has `userId`
            action: `${method} ${url.split('?')[0]}`,
            module: context.getClass().name,
            
            // --- THIS IS THE CRITICAL PART ---
            serviceName: 'payment-management', // Hardcode this service's name

            target_id: params.id,
            details: { body: body },
            ip_address: request.ip,
          };

          // 1. Log the action locally using your existing service
          const createdLog = await this.auditLogService.logAction(logData);

          // 2. Emit the full, created log to Kafka for centralization
          if (createdLog) { // Only emit if logging was successful
            this.kafkaClient.emit('audit_log_created', createdLog);
          }
        }
      }),
    );
  }
}