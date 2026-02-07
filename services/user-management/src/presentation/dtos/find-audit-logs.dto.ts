import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ActionType, ActionResult } from '../../domain/entities/audit-log.entity';

export class FindAuditLogsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  actorId?: string;
  
  @IsOptional()
  @IsEnum(ActionType)
  actionType?: ActionType;
  
  @IsOptional()
  @IsString()
  targetEntity?: string;
  
  @IsOptional()
  @IsEnum(ActionResult)
  result?: ActionResult;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}