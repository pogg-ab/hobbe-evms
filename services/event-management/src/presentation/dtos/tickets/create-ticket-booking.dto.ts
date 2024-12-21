import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { IdValueObject } from 'src/domain/value-objects/event-id.value-object';

export class CreateTicketBookingDto {
  @ApiProperty({
    description: 'Event ID related to the booking',
    example: '6c842f9f-8d07-4c2d-b5ae-9b7b1164741a',
  })
  @IsNotEmpty()
  @IsUUID()
  event_id: IdValueObject;

  @ApiProperty({ description: 'Booking Type', example: 'VIP' })
  @IsNotEmpty()
  @IsEnum(['Regular', 'VIP', 'VVIP'], {
    message:
      'booking_type must be one of the following values: Regular, VIP, or VVIP',
  })
  booking_type: 'Regular' | 'VIP' | 'VVIP';

  @ApiProperty({
    description: 'Total Amount for the Ticket Booking',
    example: 1000,
  })
  @IsNotEmpty()
  total_amount: number;

  @ApiProperty({ description: 'Is this booking a gift?', example: false })
  @IsBoolean()
  @IsOptional()
  hasGift?: boolean;

  @ApiProperty({
    description: 'Recipient ID if booking is a gift',
    example: 'd9b2d63d-a233-4c2b-8c6d-82e19a93cbbb',
  })
  @ValidateIf((o) => o.hasGift === true)
  @IsNotEmpty()
  @IsUUID()
  recipient_id?: string;

  @ApiProperty({
    description: 'Is a promocode used for the booking?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  hasPromocode?: boolean;

  @ApiProperty({
    description: 'Promocode value if used',
    example: 'SUMMER20',
  })
  @ValidateIf((o) => o.hasPromocode === true)
  @IsNotEmpty()
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
    description: 'Total Price of the booking',
    example: 950,
  })
  @IsOptional()
  @IsNumber()
  total_price?: number;
}
