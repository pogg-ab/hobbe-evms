import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLogService } from 'src/application/services/audit-log/audit-log.service';
import { AuditLog } from 'src/domain/entities/audit-log.entity';

// --- Import our Admin security components from their correct locations ---
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';

// Define a reusable constant for the admin authentication guard
const AdminAuthGuard = AuthGuard('admin-jwt');

@ApiTags('Admin: Audit Log (Events)')
@ApiBearerAuth('access-token')
@Controller('audit-logs') // A dedicated, secure route for this service's logs
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * This endpoint retrieves all audit logs specific to the event-management service.
   * It is protected and requires the 'view:audit_log' permission from the Admin's JWT.
   */
  @Get()
  @UseGuards(AdminAuthGuard, PermissionsGuard)
  @Permissions('view:audit_log:System') // Use the permission name consistent with user-management
  @ApiOperation({ summary: 'Retrieve all audit logs for the Event Management service' })
  @ApiResponse({ status: 200, description: 'List of event service audit logs', type: [AuditLog] })
  async findAll(): Promise<AuditLog[]> {
    // This calls the findAll method in the event-management AuditLogService,
    // which we previously configured to only return its own logs.
    return this.auditLogService.findAll(); 
  }
}