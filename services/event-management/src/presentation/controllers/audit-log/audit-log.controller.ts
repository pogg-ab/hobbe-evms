import { Controller, Get, Query, UseGuards, Res, Header, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditLogService } from '../../../application/services/audit-log/audit-log.service';
import { FindAuditLogsDto } from '../../dtos/find-audit-logs/find-audit-logs.dto';
import { AuditLog } from '../../../domain/entities/audit-log.entity';
// Assuming these guards/decorators exist in event-management
import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';

@ApiTags('Admin: Audit Log (Events)')
@Controller('admin/audit-logs') // Standardized route prefix for admin APIs
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Retrieve paginated and filterable audit logs for Event Management',
  })
  @ApiResponse({ status: 200, description: 'List of audit logs with total count.'})
  async find(
    @Query() filterDto: FindAuditLogsDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    // The DTO automatically validates and transforms query parameters
    return this.auditLogService.find(filterDto);
  }

  @Get('export')
  @Permissions('view:audit_log:System') // Use the same permission as find
  @ApiOperation({
    summary: 'Export filtered audit logs from Event Management to a CSV file',
  })
  @Header('Content-Type', 'text/csv')
  async export(
    @Query() filterDto: FindAuditLogsDto,
    @Res() res: Response,
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const fileName = `event-management-audit-logs-${date}.csv`;
    
    // Set the Content-Disposition header to trigger a file download
    res.header('Content-Disposition', `attachment; filename=${fileName}`);
    
    const csvData = await this.auditLogService.exportToCsv(filterDto);
    
    // Send the generated CSV data as the response body
    res.send(csvData);
  }

  @Delete('all')
  @Permissions('view:audit_log:System') // Use a specific, high-privilege permission
  @ApiOperation({
    summary: '!!! DANGEROUS !!! Delete all audit log entries for Event Management.',
    description: 'This permanently removes all event-related audit logs. This action cannot be undone.'
  })
  @ApiResponse({ status: 200, description: 'All logs successfully deleted.'})
  async deleteAll(): Promise<{ message: string; deletedCount: number }> {
    return this.auditLogService.deleteAll();
  }
  
  @Delete(':id')
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Delete a specific audit log entry by ID',
  })
  @ApiResponse({ status: 204, description: 'Log successfully deleted.'})
  @ApiResponse({ status: 404, description: 'Log not found.'})
  @HttpCode(204) // Standard HTTP code for successful deletion with no content
  async delete(@Param('id') id: string): Promise<void> {
    return this.auditLogService.delete(id);
  }
}