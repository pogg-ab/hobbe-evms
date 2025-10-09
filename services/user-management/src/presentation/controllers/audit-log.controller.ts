import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogService } from 'src/application/services/audit-log.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { AuditLog } from 'src/domain/entities/audit-log.entity';

const AdminAuthGuard = AuthGuard('admin-jwt');

@ApiTags('Admin: Audit Log (Users)')
@Controller('audit-logs')
@ApiBearerAuth('access-token')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Retrieve all audit logs for the User Management service',
  })
  async findAll(): Promise<AuditLog[]> {
    return this.auditLogService.findAll({ serviceName: 'user-management' });
  }
}
