import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsIn,
  IsInt,
} from 'class-validator';

export class SearchTicketsDto {
  @ApiPropertyOptional({
    description: 'Ticket priority (1=Low, 2=Medium, 3=High, 4=Urgent)',
    example: 4,
    enum: [1, 2, 3, 4],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Priority must be an integer' })
  @IsIn([1, 2, 3, 4], { message: 'Priority must be one of: 1, 2, 3, 4' })
  priority?: number;

  @ApiPropertyOptional({
    description:
      'Ticket status (2=Open, 3=Pending, 4=Resolved, 5=Closed, 6=Waiting on Customer, 7=Waiting on Third Party)',
    example: 2,
    enum: [2, 3, 4, 5, 6, 7],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Status must be an integer' })
  @IsIn([2, 3, 4, 5, 6, 7], {
    message:
      'Status must be one of: 2=Open, 3=Pending, 4=Resolved, 5=Closed, 6=Waiting on Customer, 7=Waiting on Third Party',
  })
  status?: number;

  @ApiPropertyOptional({
    description: 'Group ID the ticket belongs to',
    example: 11,
  })
  @IsOptional()
  @IsNumber()
  groupId?: number;

  @ApiPropertyOptional({
    description: 'Agent ID assigned to the ticket',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  agentId?: number;

  @ApiPropertyOptional({
    description: 'Ticket type (e.g. Question, Problem)',
    example: 'Problem',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Tag associated with the ticket',
    example: 'marketing',
  })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Custom string field value',
    example: 'finance',
  })
  @IsOptional()
  @IsString()
  customString?: string;

  @ApiPropertyOptional({
    description: 'Ticket created date in YYYY-MM-DD format',
    example: '2017-01-01',
  })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiPropertyOptional({
    description: 'Due date range start (YYYY-MM-DD)',
    example: '2017-10-01',
  })
  @IsOptional()
  @IsString()
  dueByStart?: string;

  @ApiPropertyOptional({
    description: 'Due date range end (YYYY-MM-DD)',
    example: '2017-10-07',
  })
  @IsOptional()
  @IsString()
  dueByEnd?: string;

  @ApiPropertyOptional({
    description: 'Page number (starts at 1)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;
}
