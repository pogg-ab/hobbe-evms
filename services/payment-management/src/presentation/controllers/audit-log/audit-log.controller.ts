import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  Header,
  Delete,
  Param,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditLogService } from '../../../application/services/audit-log/audit-log.service';
import { FindAuditLogsDto } from '../../dtos/find-audit-logs/find-audit-logs.dto';
import { AuditLog } from '../../../domain/entities/audit-log.entity';

import { AdminAuthGuard } from '../../guards/admin-auth.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Permissions } from '../../decorators/permissions.decorator';

@ApiTags('Admin: Audit Log (Payments)')
@Controller('admin/audit-logs')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) { }

  @Get()
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Retrieve paginated and filterable audit logs for Payment Management',
  })
  async find(
    @Query() filterDto: FindAuditLogsDto,
  ): Promise<{ data: AuditLog[]; total: number }> {
    return this.auditLogService.find(filterDto);
  }

  @Get('export')
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: 'Export filtered audit logs from Payment Management to a CSV file',
  })
  @Header('Content-Type', 'text/csv')
  async export(
    @Query() filterDto: FindAuditLogsDto,
    @Res() res: Response,
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `payment-management-audit-logs-${date}.csv`;
    res.header('Content-Disposition', `attachment; filename=${fileName}`);
    const csvData = await this.auditLogService.exportToCsv(filterDto);
    res.send(csvData);
  }

  @Delete('all')
  @Permissions('view:audit_log:System')
  @ApiOperation({
    summary: '!!! DANGEROUS !!! Delete all audit logs for Payment Management.',
  })
  async deleteAll(): Promise<{ message: string }> {
    await this.auditLogService.deleteAll();
    return { message: 'All payment management audit logs have been deleted.' };
  }

  @Delete(':id')
  @Permissions('view:audit_log:System')
  @ApiOperation({ summary: 'Delete a specific audit log entry by ID' })
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    try {
      await this.auditLogService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}