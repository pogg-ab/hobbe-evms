import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor';
import { AuditLogController } from 'src/presentation/controllers/audit-log/audit-log.controller';
import { JwtModule } from '@nestjs/jwt';

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
            clientId: 'payment-management-producer',
            brokers: ['localhost:9092'],
          },
        },
      },
    ]),
  ],
  controllers: [
    AuditLogController,
  ],
  providers: [
    AuditLogService,
    AuditLogInterceptor,
  ],
  exports: [
    AuditLogService,
    AuditLogInterceptor,
  ],
})
export class AuditLogModule { }