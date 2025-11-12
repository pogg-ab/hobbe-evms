import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuditLogController } from '../../presentation/controllers/audit-log.controller';

@Module({
  imports: [
    // Make the AuditLog entity and its repository available for injection
    TypeOrmModule.forFeature([AuditLog]),
  ],
  // The controller will handle API requests for viewing logs
  controllers: [AuditLogController],
  // The service contains the business logic for creating/finding logs
  providers: [AuditLogService],
  // IMPORTANT: Export the service so other modules (like AuthModule, UserModule) can inject it and create logs.
  exports: [AuditLogService],
})
export class AuditLogModule {}