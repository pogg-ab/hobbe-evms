import { Controller, Get, Query, UseGuards, Res, Header, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditLogService } from 'src/application/services/audit-log.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { AuditLog } from 'src/domain/entities/audit-log.entity';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { FindAuditLogsDto } from '../dtos/find-audit-logs.dto';
import { Response } from 'express';

@ApiTags('Admin: Audit Log')
@Controller('admin/audit-logs')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) { }

  @Get()
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Retrieve paginated and filterable audit logs for User Management',
  })
  @ApiResponse({ status: 200, description: 'List of audit logs with total count.' })
  async find(
    @Query() filterDto: FindAuditLogsDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogService.find(filterDto);
  }

  @Get('export')
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Export filtered audit logs to a CSV file',
  })
  @Header('Content-Type', 'text/csv')
  async export(
    @Query() filterDto: FindAuditLogsDto,
    @Res() res: Response,
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `audit-logs-export-${date}.csv`;

    res.header('Content-Disposition', `attachment; filename=${fileName}`);

    const csvData = await this.auditLogService.exportToCsv(filterDto);

    res.send(csvData);
  }
  @Delete('all')
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: '!!! DANGEROUS !!! Delete all audit log entries.',
    description: 'This will permanently remove all audit logs from the database. This action cannot be undone.'
  })
  @ApiResponse({ status: 200, description: 'All logs successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  async deleteAll(): Promise<{ message: string; deletedCount: number }> {
    return this.auditLogService.deleteAll();
  }
  @Delete(':id')
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Delete a specific audit log entry by ID',
  })
  @ApiResponse({ status: 204, description: 'Log successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Log not found.' })
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.auditLogService.delete(id);
  }


}