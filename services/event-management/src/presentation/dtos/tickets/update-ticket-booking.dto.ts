import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class UpdateTicketBookingDto {
  @ApiProperty({ description: 'Booking Type', example: 'VIP' })
  @IsEnum(['Regular', 'VIP', 'VVIP'])
  @IsOptional()
  booking_type?: 'Regular' | 'VIP' | 'VVIP';

  @ApiProperty({
    description: 'Total Amount for the Ticket Booking',
    example: 1000,
  })
  @IsOptional()
  total_amount?: number;

  @ApiProperty({
    description: 'User ID of the person making the booking',
    example: '12345',
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({ description: 'Booking Status', example: 'pending' })
  @IsOptional()
  @IsString()
  booking_status?: string;

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
  @IsOptional()
  @IsUUID()
  event_id?: IdValueObject;
}
