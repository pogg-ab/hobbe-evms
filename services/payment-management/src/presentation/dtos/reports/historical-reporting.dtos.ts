import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
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

class NumberRangeDto {
  @ApiProperty({ description: 'Minimum value', example: 5.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min?: number;

  @ApiProperty({ description: 'Maximum value', example: 15.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max?: number;
}

export class DailyMonthlyRevenueReportDto {
  @ApiProperty({
    description: 'Time range for filtering revenue data',
    type: DateRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  timeRange?: DateRangeDto;

  @ApiProperty({
    description: 'Array of event IDs (UUIDs) to filter the report',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventIds?: string[];

  @ApiProperty({
    description: 'Array of organizer IDs (UUIDs) to filter the report',
    example: [
      '323e4567-e89b-12d3-a456-426614174002',
      '423e4567-e89b-12d3-a456-426614174003',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  organizerIds?: string[];

  @ApiProperty({
    description: 'Currency code to filter the report',
    example: 'ETB',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Payment method to filter the report',
    example: 'Chapa',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Report granularity (daily or monthly)',
    example: 'daily',
    required: false,
  })
  @IsOptional()
  @IsString()
  granularity?: 'daily' | 'monthly';

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

export class RefundReportDto {
  @ApiProperty({
    description: 'Time range for filtering refund data',
    type: DateRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  timeRange?: DateRangeDto;

  @ApiProperty({
    description: 'Array of event IDs (UUIDs) to filter the report',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventIds?: string[];

  @ApiProperty({
    description: 'Array of refund reason codes to filter the report',
    example: ['duplicate', 'fraudulent'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reasonCodes?: string[];

  @ApiProperty({
    description: 'Currency code to filter the report',
    example: 'ETB',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Range of refund amounts to filter the report',
    type: NumberRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberRangeDto)
  amountRange?: NumberRangeDto;

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

export class PaymentMethodReportDto {
  @ApiProperty({
    description: 'Time range for filtering payment method data',
    type: DateRangeDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  timeRange?: DateRangeDto;

  @ApiProperty({
    description: 'Array of event IDs (UUIDs) to filter the report',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventIds?: string[];

  @ApiProperty({
    description: 'Array of payment methods to filter the report',
    example: ['Chapa', 'stripe'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethods?: string[];

  @ApiProperty({
    description: 'Currency code to filter the report',
    example: 'ETB',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

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
