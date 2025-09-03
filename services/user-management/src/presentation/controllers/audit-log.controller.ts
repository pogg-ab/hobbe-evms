import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; // Import the base AuthGuard
import { AuditLogService } from 'src/application/services/audit-log.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { AuditLog } from 'src/domain/entities/audit-log.entity';

// Define a reusable constant for the admin authentication guard
const AdminAuthGuard = AuthGuard('admin-jwt');

@ApiTags('Admin: Audit Log (Users)')
@Controller('audit-logs')      // <-- Uses the consistent '/admin' prefix
@ApiBearerAuth('access-token')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('view:audit_log:System')
  @ApiOperation({ summary: 'Retrieve all audit logs for the User Management service' })
  async findAll(): Promise<AuditLog[]> {
    // This now calls the service with a hardcoded filter, ensuring it only
    // ever returns logs from 'user-management'.
    return this.auditLogService.findAll({ serviceName: 'user-management' });
  }
}