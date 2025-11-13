import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. IMPORT JwtModule
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogService } from '../../application/services/audit-log/audit-log.service';
import { AuditLogController } from '../../presentation/controllers/audit-log/audit-log.controller';
import { AuditLogInterceptor } from '../../presentation/interceptors/audit-log.interceptor';
// Assuming these are used by your AdminGuard and are correctly set up
import { PermissionCheckingService } from 'src/application/services/permissions-checking/permission-checking.service';
import { kafkaPermissionConfig } from 'src/infrastructure/kafka/kafka-permission-config';

@Module({
  imports: [
    // 2. Make the AuditLog entity's repository available for injection
    TypeOrmModule.forFeature([AuditLog]),
    
    // 3. Import JwtModule to make JwtService available for the interceptor
    JwtModule.register({}), // Use register({}) if config is global or provided elsewhere

    // 4. Register Kafka clients
    ClientsModule.register([
      {
        name: 'KAFKA_PRODUCER', // Used by the interceptor to emit events
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'event-management-producer',
            brokers: ['localhost:9092'], // Ensure this is configurable
          },
        },
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'CHECK_PERMISSION_SERVICE', // Used by the PermissionCheckingService/Guard
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
    PermissionCheckingService, // Required provider for the controller's guard
  ],
  // 5. IMPORTANT: Export the service and interceptor so other modules can use them
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule {}