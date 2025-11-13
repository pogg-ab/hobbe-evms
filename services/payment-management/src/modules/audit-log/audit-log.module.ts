import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // <-- IMPORT
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { AuditLogInterceptor } from 'src/presentation/interceptors/audit-log.interceptor'; 
import { AuditLogController } from 'src/presentation/controllers/audit-log/audit-log.controller'; 
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    
    // JWT Module is required by the interceptor to decode tokens
    JwtModule.register({}), 

    // Kafka client configuration for this specific microservice
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'payment-management-producer', // <-- CUSTOMIZED for this service
            brokers: ['localhost:9092'], // Or your config value
          },
        },
      },
    ]),
  ],
  controllers: [
    AuditLogController, 
  ],
  providers: [
    // We only need the service and interceptor. The repository is provided by TypeOrmModule.
    AuditLogService,
    AuditLogInterceptor,
  ],
  exports: [
    // We export these so other modules can import this module and use them.
    AuditLogService,
    AuditLogInterceptor,
  ],
})
export class AuditLogModule {}