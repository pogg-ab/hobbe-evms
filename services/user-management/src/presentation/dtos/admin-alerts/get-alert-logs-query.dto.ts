// src/presentation/dtos/admin-alerts/get-alert-logs-query.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
// Corrected import names to match your entity file
import { AdminAlertSeverity, AdminAlertType } from 'src/domain/entities/admin-alert.entity';

export class GetAlertLogsQueryDto {
  @ApiPropertyOptional({ enum: AdminAlertType, description: 'Filter by alert type' })
  @IsEnum(AdminAlertType)
  @IsOptional()
  alert_type?: AdminAlertType;

  // Note: We will join with the admin_alerts table to filter by severity
  @ApiPropertyOptional({ enum: AdminAlertSeverity, description: 'Filter by severity' })
  @IsEnum(AdminAlertSeverity)
  @IsOptional()
  severity?: AdminAlertSeverity;

  @ApiPropertyOptional({ description: 'Filter for logs triggered after this date (ISO 8601 format)', example: '2025-09-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;
  
  @ApiPropertyOptional({ description: 'Filter for logs triggered before this date (ISO 8601 format)', example: '2025-09-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}