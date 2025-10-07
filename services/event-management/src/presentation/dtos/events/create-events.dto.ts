import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';
import { CreateBankAccountDto } from 'src/presentation/dtos/bank-accounts/create-bank-acounts.dto';
import { CreateTicketsHeadingDto } from '../tickets/create-tickets-heading.dto';
import { CreateTicketsDto } from '../tickets/create-tickets.dto';
import { CreatePromocodeDto } from '../tickets/create-promocode.dto';
import { CreateCategoriesDto } from '../categories/categories.dto';

export class CreateEventsDto {
  // user_id: string;

  @ApiProperty({ description: 'Event Title', example: 'Demo Event' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Event Thumbnail',
    example:
      'https://3.files.edl.io/7e26/22/02/01/162416-f4c177eb-1c0c-4604-ad72-2fc53c318332.jpg',
  })
  // @IsNotEmpty()
  thumbnail?: string;

  // @ApiProperty({ description: 'Event Cover Image', example: 'https://3.files.edl.io/7e26/22/02/01/162416-f4c177eb-1c0c-4604-ad72-2fc53c318332.jpg' })
  // // @IsNotEmpty()
  // cover_image?: string;

  @ApiProperty({ description: 'Event Type', example: 'In Person' })
  @IsNotEmpty()
  event_type: string;

  @ApiProperty({ description: 'Event Has Promocode ?', example: false })
  @IsNotEmpty()
  hasPromocode: boolean;

  @ApiProperty({ description: 'Event is Paid ?', example: true })
  @IsNotEmpty()
  isPaid: boolean;

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

  @ApiProperty({ description: 'Event Location', example: 'Addis Ababa' })
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Event Location', example: '9.254140' })
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({ description: 'Event Location', example: '38.990629' })
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({ example: new Date(), description: 'Event Start Date' })
  @IsNotEmpty()
  event_start_date: Date;

  @ApiProperty({ example: new Date(), description: 'Event End Date' })
  @IsNotEmpty()
  event_end_date: Date;

  @ApiProperty({
    description: 'Event Category',
    isArray: true,
    example: ['Sports', 'Health'],
  })
  @IsNotEmpty()
  categories: string[];

  @ApiProperty({ description: 'Tickets', type: CreateTicketsHeadingDto })
  ticket_heading?: CreateTicketsHeadingDto;

  @ApiProperty({
    description: 'Promo Code',
    isArray: true,
    type: CreatePromocodeDto,
  })
  promocodes?: CreatePromocodeDto[];

  @ApiProperty({
    description: 'List of Associated Bank Accounts',
    isArray: true,
    type: CreateBankAccountDto,
  })
  // @IsNotEmpty()
  bank_accounts?: CreateBankAccountDto[];
}
