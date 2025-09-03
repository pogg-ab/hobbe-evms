import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateTaxDto {
    @ApiProperty({
        description: 'Tax rate as a percentage (e.g., 0.08 for 8%)',
        example: 0.08,
    })
    @IsNumber()
    rate: number;

    @ApiProperty({
        description: 'Effective date of the tax rate',
        example: '2025-01-01',
    })
    @IsDateString()
    effective_date: Date;
}

export class UpdateTaxDto {
    @ApiProperty({
        description: 'Tax rate as a percentage (e.g., 0.08 for 8%)',
        example: 0.08,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    rate?: number;

    @ApiProperty({
        description: 'Effective date of the tax rate',
        example: '2025-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    effective_date?: Date;
}