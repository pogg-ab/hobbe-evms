import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- IMPORT
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { AUDIT_LOG_REPOSITORY_TOKEN } from 'src/domain/repositories/audit-log/audit-log.repository.token';
import { AuditLogRepositoryImpl } from 'src/infrastructure/persistence/repositories/audit-log.repository.impl';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { AuditLogController } from 'src/presentation/controllers/audit-log/audit-log.controller';
import { PermissionCheckingService } from 'src/application/services/permissions-checking/permission-checking.service';
import { kafkaPermissionConfig } from 'src/infrastructure/kafka/kafka-permission-config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-management-producer',
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'CHECK_PERMISSION_SERVICE',
        useFactory: async () => ({
          transport: kafkaPermissionConfig.transport,
          options: kafkaPermissionConfig.options,
        }),
      },
    ]),
  ],

  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditLogInterceptor,
    PermissionCheckingService,
    {
      provide: AUDIT_LOG_REPOSITORY_TOKEN,
      useClass: AuditLogRepositoryImpl,
    },
  ],
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule {}
