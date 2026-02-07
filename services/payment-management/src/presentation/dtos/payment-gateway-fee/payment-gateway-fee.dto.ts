import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreatePaymentGatewayFeeDto {
    @ApiProperty({
        description: 'Name of the payment gateway provider (e.g., Stripe, PayPal)',
        example: 'Stripe',
    })
    @IsString()
    provider_name: string;

    @ApiProperty({
        description: 'Percentage rate for the payment gateway fee (e.g., 0.029 for 2.9%)',
        example: 0.029,
    })
    @IsNumber()
    percentage_rate: number;

    @ApiProperty({
        description: 'Fixed fee for the payment gateway (e.g., 0.30 for $0.30)',
        example: 0.30,
    })
    @IsNumber()
    fixed_fee: number;

    @ApiProperty({
        description: 'Effective date of the payment gateway fee',
        example: '2025-01-01',
    })
    @IsDateString()
    effective_date: Date;
}

export class UpdatePaymentGatewayFeeDto {
    @ApiProperty({
        description: 'Name of the payment gateway provider (e.g., Stripe, PayPal)',
        example: 'Stripe',
        required: false,
    })
    @IsOptional()
    @IsString()
    provider_name?: string;

    @ApiProperty({
        description: 'Percentage rate for the payment gateway fee (e.g., 0.029 for 2.9%)',
        example: 0.029,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    percentage_rate?: number;

    @ApiProperty({
        description: 'Fixed fee for the payment gateway (e.g., 0.30 for $0.30)',
        example: 0.30,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    fixed_fee?: number;

    @ApiProperty({
        description: 'Effective date of the payment gateway fee',
        example: '2025-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    effective_date?: Date;
}