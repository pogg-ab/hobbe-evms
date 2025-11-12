import { Controller, Get, Query, UseGuards, Res, Header, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditLogService } from 'src/application/services/audit-log.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { FindAuditLogsDto } from '../dtos/find-audit-logs.dto';
import { Response } from 'express'; // <-- IMPORT Response from express

@ApiTags('Admin: Audit Log')
@Controller('admin/audit-logs')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Retrieve paginated and filterable audit logs for User Management',
  })
  @ApiResponse({ status: 200, description: 'List of audit logs with total count.'})
  async find(
    @Query() filterDto: FindAuditLogsDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    // The DTO automatically validates and transforms query parameters
    return this.auditLogService.find(filterDto);
  }

  // --- NEW EXPORT ENDPOINT ---
  @Get('export')
  @Permissions('view:audit_log:System') // Use the same permission as find
  @ApiOperation({
    summary: 'Export filtered audit logs to a CSV file',
  })
  @Header('Content-Type', 'text/csv')
  async export(
    @Query() filterDto: FindAuditLogsDto,
    @Res() res: Response,
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const fileName = `audit-logs-export-${date}.csv`;
    
    // Set the Content-Disposition header to trigger a file download in the browser
    res.header('Content-Disposition', `attachment; filename=${fileName}`);
    
    const csvData = await this.auditLogService.exportToCsv(filterDto);
    
    // Send the generated CSV data as the response body
    res.send(csvData);
  }
  @Delete('all') // Use a specific path like 'all' or 'truncate'
@Permissions('view:audit_log:System') // Reuse the same high-privilege permission
@ApiOperation({
  summary: '!!! DANGEROUS !!! Delete all audit log entries.',
  description: 'This will permanently remove all audit logs from the database. This action cannot be undone.'
})
@ApiResponse({ status: 200, description: 'All logs successfully deleted.'})
@ApiResponse({ status: 403, description: 'Forbidden resource.'})
async deleteAll(): Promise<{ message: string; deletedCount: number }> {
  // We are not logging this action itself, as it would be immediately deleted.
  // In a real system, this action might be logged to a separate, immutable log stream.
  return this.auditLogService.deleteAll();
}
  @Delete(':id')
@Permissions('view:audit_log:System') // <-- IMPORTANT: Use a specific, high-privilege permission
@ApiOperation({
  summary: 'Delete a specific audit log entry by ID',
})
@ApiResponse({ status: 204, description: 'Log successfully deleted.'})
@ApiResponse({ status: 403, description: 'Forbidden resource.'})
@ApiResponse({ status: 404, description: 'Log not found.'})
@HttpCode(204) // Standard HTTP code for a successful deletion with no content to return
async delete(@Param('id') id: string): Promise<void> {
  return this.auditLogService.delete(id);
}


}