import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogService } from '../../application/services/audit-log/audit-log.service';
import { AuditLogController } from '../../presentation/controllers/audit-log/audit-log.controller';
import { AuditLogInterceptor } from '../../presentation/interceptors/audit-log.interceptor';
import { PermissionCheckingService } from 'src/application/services/permissions-checking/permission-checking.service';
import { kafkaPermissionConfig } from 'src/infrastructure/kafka/kafka-permission-config';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    JwtModule.register({}),
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
  ],
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule { }