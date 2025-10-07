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
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    @Inject('KAFKA_PRODUCER') private readonly kafkaClient: ClientKafka,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, params, body, user } = request;

    return next.handle().pipe(
      tap(async () => {
        if (method !== 'GET') {
          const logData = {
            user_id: user?.userId,
            action: `${method} ${url.split('?')[0]}`,
            module: context.getClass().name,

            serviceName: 'event-management',

            target_id: params.id,
            details: { body: body },
            ip_address: request.ip,
          };

          const createdLog = await this.auditLogService.logAction(logData);

          if (createdLog) {
            this.kafkaClient.emit('audit_log_created', createdLog);
          }
        }
      }),
    );
  }
}
