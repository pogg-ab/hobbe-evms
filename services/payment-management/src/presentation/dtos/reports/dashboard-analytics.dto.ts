import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class DateRangeDto {
  @ApiProperty({
    description: 'Start date (ISO format)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  start?: string;

  @ApiProperty({
    description: 'End date (ISO format)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  end?: string;
}

export class DashboardAnalyticsDto {
  @ApiProperty({
    description: 'Time range for the analytics report',
    type: DateRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  timeRange?: DateRangeDto;
}
