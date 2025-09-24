//lets create refund-request dto

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RefundStatus } from '../../../domain/entities/refund-request.entity';
export class ChapaRefundRequestDto {
  @ApiPropertyOptional({
    description: 'ID of the user requesting the refund',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  userid?: string;


  @ApiPropertyOptional({
    description: 'Reason for the refund',
    example: 'Customer requested a refund due to duplicate payment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
