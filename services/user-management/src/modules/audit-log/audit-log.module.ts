// in user-management/src/audit-log.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogService } from 'src/application/services/audit-log.service';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { AUDIT_LOG_REPOSITORY_TOKEN } from 'src/domain/repositories/audit-log.repository.token';
import { AuditLogRepositoryImpl } from 'src/infrastructure/persistence/repositories/audit-log.repository.impl';
import { AuditLogController } from 'src/presentation/controllers/audit-log.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), forwardRef(() => AuthModule)],
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    {
      provide: AUDIT_LOG_REPOSITORY_TOKEN,
      useClass: AuditLogRepositoryImpl,
    },
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
