// src/audit-log/dto/find-audit-logs.dto.ts

import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ActionType, ActionResult } from '../../../domain/entities/audit-log.entity';

/**
 * Defines and validates the query parameters for finding and filtering payment audit logs.
 * This is used by the AuditLogController's GET endpoints.
 */
export class FindAuditLogsDto {
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @IsOptional()
  @IsEnum(ActionType, { message: 'Invalid action type provided for payments.' })
  actionType?: ActionType;

  @IsOptional()
  @IsString()
  targetEntity?: string;

  @IsOptional()
  @IsEnum(ActionResult, { message: 'Result must be either SUCCESS or FAILURE.' })
  result?: ActionResult;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
  
  // Columns for sorting
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'sortOrder must be either ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}