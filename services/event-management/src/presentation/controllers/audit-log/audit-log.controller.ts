import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service';
import { AuditLog } from 'src/domain/entities/audit-log.entity';

import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';

const AdminAuthGuard = AuthGuard('admin-jwt');

@ApiTags('Admin: Audit Log (Events)')
@ApiBearerAuth('access-token')
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Retrieve all audit logs for the Event Management service',
  })
  @ApiResponse({
    status: 200,
    description: 'List of event service audit logs',
    type: [AuditLog],
  })
  async findAll(): Promise<AuditLog[]> {
    return this.auditLogService.findAll();
  }
}
