import { IsOptional, IsString, IsUUID, IsEnum, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ActionType, ActionResult } from '../../../domain/entities/audit-log.entity';

/**
 * Defines and validates the query parameters for finding and filtering audit logs.
 * This is used by the AuditLogController's GET endpoints.
 */
export class FindAuditLogsDto {
  /**
   * Filter logs by the ID of the user who performed the action.
   */
  @IsOptional()
  @IsUUID()
  actorId?: string;

  /**
   * Filter logs by the type of action performed.
   */
  @IsOptional()
  @IsEnum(ActionType, { message: 'Invalid action type provided.' })
  actionType?: ActionType;

  /**
   * Filter logs by the entity that was acted upon (e.g., 'Event', 'Comment').
   */
  @IsOptional()
  @IsString()
  targetEntity?: string;

  /**
   * Filter logs by the outcome of the action (SUCCESS or FAILURE).
   */
  @IsOptional()
  @IsEnum(ActionResult, { message: 'Result must be either SUCCESS or FAILURE.' })
  result?: ActionResult;
  
  /**
   * The start date for the date range filter (inclusive). Format: YYYY-MM-DD.
   */
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  /**
   * The end date for the date range filter (inclusive). Format: YYYY-MM-DD.
   */
  @IsOptional()
  @IsDateString()
  toDate?: string;

  /**

   * The page number for pagination.
   * @default 1
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * The number of items to return per page.
   * @default 10
   */
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100) // Prevent users from requesting too much data at once
  limit?: number = 10;
}