import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class CreateTicketBookingDto {
  @ApiProperty({ description: 'Booking Type', example: 'VIP' })
  @IsNotEmpty()
  @IsEnum(['Regular', 'VIP', 'VVIP'])
  booking_type: 'Regular' | 'VIP' | 'VVIP';

  @ApiProperty({
    description: 'Total Amount for the Ticket Booking',
    example: 1000,
  })
  @IsNotEmpty()
  total_amount: number;

  @ApiProperty({
    description: 'User ID of the person making the booking',
    example: '12345',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'Booking Status', example: 'pending' })
  @IsNotEmpty()
  @IsString()
  booking_status: string;

  @ApiProperty({ description: 'Is this booking a gift?', example: false })
  @IsBoolean()
  @IsOptional()
  hasGift?: boolean;

  @ApiProperty({
    description: 'Recipient ID if booking is a gift',
    example: '67890',
  })
  @IsOptional()
  @IsString()
  recipient_id?: string;

  @ApiProperty({
    description: 'Is a promocode used for the booking?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  hasPromocode?: boolean;

  @ApiProperty({ description: 'Promocode value if used', example: 'SUMMER20' })
  @IsOptional()
  @IsString()
  promocode_value?: string;

  @ApiProperty({
    description: 'Has the payment been processed?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  hasPayment?: boolean;

  @ApiProperty({ description: 'Is Partnership', example: true })
  @IsBoolean()
  is_partnership: boolean;

  @ApiProperty({ description: 'Payment Method', example: 'Credit Card' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiProperty({
    description: 'Total Price of the booking after payment',
    example: 950,
  })
  @IsOptional()
  @IsNumber()
  total_price?: number;

  @ApiProperty({
    description: 'Event ID related to the booking',
    example: '6c842f9f-8d07-4c2d-b5ae-9b7b1164741a',
  })
  @IsNotEmpty()
  @IsUUID()
  event_id: IdValueObject;
}
