import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID, Length, Max } from "class-validator";


export class CreateBankAccountDto {
    @ApiProperty({ description: 'Country', example: 'Ethiopia' })
    @IsNotEmpty()
    country: string;

    @ApiProperty({
        description: 'Currency Code',
        example: 'ETB'
    })
    @IsNotEmpty()
    @IsString()
    @Length(1, 50, { message: 'Currency code must be between 1 and 50 characters' })
    currency: string;

    @ApiProperty({
        description: 'Bank Code or Identifier',
        example: 'CBE'
    })
    @IsNotEmpty()
    @IsString()
    @Length(1, 50, { message: 'Bank code must be between 1 and 50 characters' })
    bank_name: string;


    @ApiProperty({ description: 'Account Owner', example: 'Challa Dibba' })
    @IsNotEmpty()
    account_owner: string;


    @ApiProperty({ description: 'Account Number', example: '10002458488' })
    @IsNotEmpty()
    account_number: string;


    @ApiProperty({ description: 'Profit Share Amount', example: '35' })
    @IsNotEmpty()
    @Max(100)
    profit_share_amount: number;


}