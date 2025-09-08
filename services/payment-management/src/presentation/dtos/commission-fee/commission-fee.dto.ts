import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateCommissionFeeDto {
  @ApiProperty({
    description: 'ID of the organizer (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  organizer_id: string;

  @ApiProperty({
    description:
      'Type of event the commission applies to (e.g., VVIP,VIP,Regular, All)',
    example: 'Regular',
  })
  @IsString()
  applies_to_event_type: string;

  @ApiProperty({
    description: 'Commission rate as a percentage (e.g., 0.05 for 5%)',
    example: 0.05,
  })
  @IsNumber()
  rate: number;

  @ApiProperty({
    description: 'Effective date of the commission rate',
    example: '2025-01-01',
  })
  @IsDateString()
  effective_date: Date;
}

export class UpdateCommissionFeeDto {
  @ApiProperty({
    description: 'ID of the organizer (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  organizer_id?: string;

  @ApiProperty({
    description:
      'Type of event the commission applies to (e.g., concert, conference)',
    example: 'concert',
    required: false,
  })
  @IsOptional()
  @IsString()
  applies_to_event_type?: string;

  @ApiProperty({
    description: 'Commission rate as a percentage (e.g., 0.05 for 5%)',
    example: 0.05,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiProperty({
    description: 'Effective date of the commission rate',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effective_date?: Date;
}
