import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { CreateBankAccountDto } from 'src/presentation/dtos/bank-accounts/create-bank-acounts.dto';

export class CreateEventsDto {
  @ApiProperty({ description: 'Event Title', example: 'Demo Event' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Event Description',
    example: 'Demo Event Description',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Event Privacy', example: 'public' })
  @IsNotEmpty()
  @IsEnum(['public', 'private', 'group'])
  privacy: string;

  @ApiProperty({ description: 'Event Catagory', example: 'Technology' })
  @IsNotEmpty()
  catagory: string;

  @ApiProperty({ description: 'Event Location', example: 'Addis Ababa' })
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: new Date(), description: 'Event Start Date' })
  @IsNotEmpty()
  event_start_date: Date;

  @ApiProperty({ example: new Date(), description: 'Event End Date' })
  @IsNotEmpty()
  event_end_date: Date;

  @ApiProperty({
    example: [
      {
        bank_name: 'Bank of Abyssina',
        account_owner: 'Mohammed Ali',
        account_number: '4415278',
      },
      {
        bank_name: 'CBE',
        account_owner: 'Challa Eabba',
        account_number: '10004456789',
      },
    ],
    description: 'List of associated bank accounts',
    isArray: true,
    type: CreateBankAccountDto,
  })
  @IsNotEmpty()
  bank_accounts: CreateBankAccountDto[];
}
