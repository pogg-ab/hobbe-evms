import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuditLogController } from '../../presentation/controllers/audit-log.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule { }