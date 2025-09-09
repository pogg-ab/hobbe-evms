import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PayoutMethod {
  BANK_ACCOUNT = 'bank_account',
  MOBILE_MONEY = 'mobile_money',
}

export enum Currency {
  ETB = 'ETB',
  USD = 'USD',
}

export class BeneficiaryDetailsDto {
  @ApiProperty({ example: '1000138985597', description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({ example: 'John Doe', description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty({ 
    example: '013', 
    description: 'Bank code (required for bank transfers)',
    required: false
  })
  @IsString()
  @IsOptional()
  bank_code?: string; // Required for bank transfers

  @ApiProperty({ 
    example: 'telebirr', 
    description: 'Mobile money provider (required for mobile money transfers)',
    enum: ['telebirr', 'cbebirr', 'm_pesa', 't_pesa'],
    required: false
  })
  @IsString()
  @IsOptional()
  mobile_money_provider?: string; // Required for mobile money
}

export class CreateChapaPayoutDto {
  @ApiProperty({ 
    example: 1000, 
    description: 'Amount to be paid out',
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ 
    example: 'ETB', 
    description: 'Currency code',
    enum: Currency,
    default: 'ETB'
  })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ 
    example: 'payout-1234567890', 
    description: 'Unique reference for the payout',
    pattern: '^[a-zA-Z0-9-_]+$'
  })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({ 
    example: 'Payment for Event Organizer', 
    description: 'Optional description of the payout',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    enum: PayoutMethod, 
    description: 'Payout method',
    example: PayoutMethod.BANK_ACCOUNT
  })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @ApiProperty({ 
    type: BeneficiaryDetailsDto,
    description: 'Beneficiary details',
    example: {
      mobile_money_provider: 'telebirr',
      account_number: '0934515656',
      account_name: 'HuBB',
      bank_code: '855' // or mobile_money_provider: 'telebirr'
    }
  })
  @IsNotEmpty()
  beneficiary: BeneficiaryDetailsDto;

  @ApiProperty({ 
    example: 'https://54f259c686fe.ngrok-free.app/webhooks/chapa', 
    description: 'Webhook URL to receive payment status updates',
    required: false
  })
  @IsString()
  @IsOptional()
  callback_url?: string;
}

export class ChapaPayoutResponseDto {
  @ApiProperty({ 
    example: 'success', 
    description: 'Status of the API request',
    enum: ['success', 'error']
  })
  status: string;

  @ApiProperty({ 
    example: 'Payout initiated successfully', 
    description: 'Human-readable message',
    required: false
  })
  message?: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string', example: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
      reference: { type: 'string', example: 'payout-1234567890' },
      amount: { type: 'number', example: 1000 },
      currency: { type: 'string', example: 'ETB' },
      status: { 
        type: 'string', 
        example: 'pending',
        enum: ['pending', 'processing', 'completed', 'failed']
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
      fee: { type: 'number', example: 10.5, required: false },
      failure_reason: { type: 'string', required: false },
      metadata: { 
        type: 'object',
        additionalProperties: true,
      }
    }
  })
  data: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    updated_at: string;
    fee?: number;
    failure_reason?: string;
    metadata?: Record<string, any>;
  };
}

export class PayoutStatusResponseDto {
  @ApiProperty({ 
    example: 'success', 
    description: 'Status of the API request',
    enum: ['success', 'error']
  })
  status: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string', example: '7c9e6679-7425-40de-944b-e07fc1f90ae7' },
      reference: { type: 'string', example: 'payout-1234567890' },
      amount: { type: 'number', example: 1000 },
      currency: { type: 'string', example: 'ETB' },
      status: { 
        type: 'string', 
        example: 'completed',
        enum: ['pending', 'processing', 'completed', 'failed']
      },
      fee: { type: 'number', example: 10.5 },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
      completed_at: { type: 'string', format: 'date-time', nullable: true },
      failure_reason: { type: 'string', nullable: true },
      beneficiary: {
        type: 'object',
        properties: {
          account_number: { type: 'string', example: '1000138985597' },
          account_name: { type: 'string', example: 'John Doe' },
          bank_code: { type: 'string', example: '013', nullable: true },
          mobile_money_provider: { type: 'string', example: 'telebirr', nullable: true }
        }
      },
      metadata: { 
        type: 'object',
        additionalProperties: true,
      }
    }
  })
  data: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    fee: number;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
    failure_reason: string | null;
    beneficiary: {
      account_number: string;
      account_name: string;
      bank_code?: string;
      mobile_money_provider?: string;
    };
    metadata?: Record<string, any>;
  };
}
