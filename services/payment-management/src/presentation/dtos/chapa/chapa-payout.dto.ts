import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, ValidateIf } from "class-validator";

export class ChapaPayoutDto {
  @ApiProperty({ example: 'John Doe', description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  account_name: string;

  @ApiProperty({ example: '1000138985591', description: 'Account number' })
  @IsString()
  @IsNotEmpty()
  account_number: string;

  @ApiProperty({ example: 946, description: 'Bank code (required for bank transfers)' })
  @ValidateIf(o => !o.mobile_money_provider) // required if no mobile money provider
  @IsNumber()
  @IsNotEmpty()
  bank_code?: number;

  @ApiProperty({ example: 'telebirr', description: 'Mobile money provider (required for mobile money transfers)' })
  @ValidateIf(o => !o.bank_code) // required if no bank code
  @IsString()
  @IsNotEmpty()
  mobile_money_provider?: string;

  @ApiProperty({ example: '1000', description: 'Amount to be paid out' })
  @IsNumberString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ example: 'ETB', description: 'Currency code' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'payout-1234567890', description: 'Unique reference for the payout' })
  @IsString()
  @IsNotEmpty()
  reference: string;
}
