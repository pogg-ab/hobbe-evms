import { IsOptional, IsString, IsUUID, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ActionType, ActionResult } from '../../../domain/entities/audit-log.entity';

export class FindAuditLogsDto {

  @IsOptional()
  @IsUUID()
  actorId?: string;


  @IsOptional()
  @IsEnum(ActionType, { message: 'Invalid action type provided.' })
  actionType?: ActionType;

  @IsOptional()
  @IsString()
  targetEntity?: string;


  @IsOptional()
  @IsEnum(ActionResult, { message: 'Result must be either SUCCESS or FAILURE.' })
  result?: ActionResult;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

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
}