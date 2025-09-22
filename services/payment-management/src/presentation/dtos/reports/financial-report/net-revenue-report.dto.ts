import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
  ValidateNested,
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

export class NetRevenueReportDto {
  @ApiProperty({
    description: 'Time range for filtering transaction dates in the report',
    type: DateRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  timeRange?: DateRangeDto;

  @ApiProperty({
    description: 'Currency code to filter the report',
    example: 'ETB',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Group by option',
    example: 'day',
    required: false,
    enum: ['day', 'month', 'year'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['day', 'month', 'year'])
  groupBy?: 'day' | 'month' | 'year';

  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Limit per page', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
