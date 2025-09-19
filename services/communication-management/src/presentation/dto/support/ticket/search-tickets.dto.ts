import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';

export class SearchTicketsDto {
  @ApiPropertyOptional({
    description:
      'Ticket priority (1=Low, 4=Urgent). Supports operators like >3',
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priority?: number;

  @ApiPropertyOptional({
    description: 'Ticket status (1=Open, 2=Pending, etc.)',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
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
